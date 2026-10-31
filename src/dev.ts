// Local development only: pretend the DingTalk proxy already authenticated
// the user in VITE_DEV_USER, so the app skips dd.ready()/requestAuthCode().
//
// Requests are still signed for the backend by server/proxySim.ts, which treats
// the `user-token` header as the student ID. Opening the app with a `corpId`
// query parameter (i.e. inside DingTalk) keeps the real login flow.

const devUser = String(import.meta.env.VITE_DEV_USER ?? '').trim()

if (
  import.meta.env.DEV &&
  devUser &&
  !new URLSearchParams(location.search).has('corpId') &&
  !localStorage.getItem('user-token')
) {
  localStorage.setItem('user-token', devUser)
}
