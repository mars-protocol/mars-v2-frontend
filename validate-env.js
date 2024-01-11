require('dotenv').config({ path: './.env.local' })

if (!process.env.CHARTING_LIBRARY_USERNAME) {
  throw 'CHARTING_LIBRARY_USERNAME is not defined'
}
if (!process.env.CHARTING_LIBRARY_ACCESS_TOKEN) {
  throw 'CHARTING_LIBRARY_ACCESS_TOKEN is not defined'
}
if (!process.env.CHARTING_LIBRARY_REPOSITORY) {
  throw 'CHARTING_LIBRARY_REPOSITORY is not defined'
}
if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_ID) {
  throw 'NEXT_PUBLIC_WALLET_CONNECT_ID is not defined'
}
if (!process.env.NEXT_PUBLIC_PYTH_API) {
  throw 'NEXT_PUBLIC_PYTH_API is not defined'
}

console.log('✅ Required env variables set')
