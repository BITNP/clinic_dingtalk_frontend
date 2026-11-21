import { endpoints } from '@/api/endpoints'

const DEFAULT_INTERVAL = 10_000
const CONFIG_INTERVAL = 60_000
const MAX_INTERVAL = 2_147_483_647

type Part = 'announcement' | 'location' | 'record'
type Counters = Record<string, number>
type Swaps = Record<Part, (isCurrent: () => boolean) => Promise<void>>

/** Polls counters and retries failed snapshot swaps without replacing visible data. */
export function createPoller(swaps: Swaps) {
  let running = false
  let epoch = 0
  let interval = DEFAULT_INTERVAL
  let timer: ReturnType<typeof setTimeout> | undefined
  let configTimer: ReturnType<typeof setTimeout> | undefined
  let inFlight = false
  let baseline: Counters | null = null
  const dirty = new Map<Part, number>()
  let revision = 0

  function mark(part: Part): void { dirty.set(part, ++revision) }
  function schedule(): void {
    if (running && interval > 0 && !timer && !inFlight) timer = setTimeout(tick, interval)
  }
  function scheduleConfig(): void {
    if (running && !configTimer) configTimer = setTimeout(async () => {
      configTimer = undefined
      if (!running) return
      if (!document.hidden) await readConfig()
      scheduleConfig()
    }, CONFIG_INTERVAL)
  }
  async function readConfig(): Promise<void> {
    const requestEpoch = epoch
    try {
      const result = await endpoints.getSyncConfig()
      const next = result.interval_ms
      if (!running || requestEpoch !== epoch || typeof next !== 'number' || !Number.isFinite(next) || next < 0) return
      const previous = interval
      interval = Math.min(next, MAX_INTERVAL)
      if (previous !== interval) {
        if (timer) clearTimeout(timer)
        timer = undefined
        schedule()
      }
    } catch { /* Keep the previous interval and retry configuration later. */ }
  }
  async function poll(): Promise<void> {
    const requestEpoch = epoch
    const current = await endpoints.getSync()
    if (!running || requestEpoch !== epoch) return
    for (const group of ['announcement', 'record', 'room', 'service_date']) {
      if (typeof current[group] !== 'number' || !Number.isSafeInteger(current[group]) || current[group] < 0) {
        throw new Error('invalid sync counters')
      }
    }
    const changed = (name: string) => baseline === null || baseline[name] !== current[name]
    if (changed('announcement')) mark('announcement')
    if (changed('room') || changed('service_date') || changed('record')) mark('location')
    if (changed('record')) mark('record')
    baseline = current
    const pending = Array.from(dirty.entries())
    await Promise.all(pending.map(async ([part, version]) => {
      try {
        await swaps[part](() => running && requestEpoch === epoch)
        if (running && requestEpoch === epoch && dirty.get(part) === version) dirty.delete(part)
      } catch { /* Keep this part pending for the next poll. */ }
    }))
  }
  async function tick(): Promise<void> {
    if (timer) clearTimeout(timer)
    timer = undefined
    if (!running || inFlight) return
    if (!document.hidden) {
      inFlight = true
      try { await poll() } catch { /* Preserve the previous counters for retry. */ }
      finally { inFlight = false }
    }
    schedule()
  }
  function visible(): void { if (!document.hidden) void tick() }
  async function start(): Promise<void> {
    if (running) return
    running = true
    const started = ++epoch
    document.addEventListener('visibilitychange', visible)
    await Promise.all([readConfig(), tick()])
    if (running && epoch === started) { schedule(); scheduleConfig() }
  }
  function stop(): void {
    running = false
    epoch++
    if (timer) clearTimeout(timer)
    if (configTimer) clearTimeout(configTimer)
    timer = undefined
    configTimer = undefined
    document.removeEventListener('visibilitychange', visible)
    baseline = null
    dirty.clear()
  }
  return { start, stop }
}
