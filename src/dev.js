// Local development only: pretend the DingTalk proxy already authenticated
// the user in DEV_USER, so the app skips dd.ready()/requestAuthCode().
//
// Requests are still signed for the backend by build/proxySim.js, which
// treats the `user-token` header as the student ID. Opening the app with a
// `corpId` query parameter (i.e. inside DingTalk) keeps the real login flow.

const devUser = String(process.env.DEV_USER || '').trim()

if (
  process.env.NODE_ENV === 'development' &&
  devUser &&
  !/[?&]corpId=/.test(location.search) &&
  !localStorage.getItem('user-token')
) {
  localStorage.setItem('user-token', devUser)
}
