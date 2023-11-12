require('dotenv').config({ path: './.env.local' })

if (!process.env.NEXT_PUBLIC_ACCOUNT_NFT) {
  throw 'NEXT_PUBLIC_ACCOUNT_NFT is not defined'
}
if (!process.env.NEXT_PUBLIC_CREDIT_MANAGER) {
  throw 'NEXT_PUBLIC_CREDIT_MANAGER is not defined'
}
if (!process.env.NEXT_PUBLIC_INCENTIVES) {
  throw 'NEXT_PUBLIC_INCENTIVES is not defined'
}
if (!process.env.NEXT_PUBLIC_ORACLE) {
  throw 'NEXT_PUBLIC_ORACLE is not defined'
}
if (!process.env.NEXT_PUBLIC_RED_BANK) {
  throw 'NEXT_PUBLIC_RED_BANK is not defined'
}
if (!process.env.NEXT_PUBLIC_SWAPPER) {
  throw 'NEXT_PUBLIC_SWAPPER is not defined'
}
if (!process.env.NEXT_PUBLIC_CHAIN_ID) {
  throw 'NEXT_PUBLIC_CHAIN_ID is not defined'
}
if (!process.env.NEXT_PUBLIC_NETWORK) {
  throw 'NEXT_PUBLIC_NETWORK is not defined'
}
if (!process.env.NEXT_PUBLIC_GQL) {
  throw 'NEXT_PUBLIC_GQL is not defined'
}
if (!process.env.NEXT_PUBLIC_REST) {
  throw 'NEXT_PUBLIC_REST is not defined'
}
if (!process.env.NEXT_PUBLIC_VAULT_APR) {
  throw 'NEXT_PUBLIC_VAULT_APR is not defined'
}
if (!process.env.NEXT_PUBLIC_PARAMS) {
  throw 'NEXT_PUBLIC_PARAMS is not defined'
}
if (!process.env.NEXT_PUBLIC_CANDLES_ENDPOINT_PYTH) {
  throw 'NEXT_PUBLIC_CANDLES_ENDPOINT_PYTH is not defined'
}
if (!process.env.NEXT_PUBLIC_CANDLES_ENDPOINT_THE_GRAPH) {
  throw 'NEXT_PUBLIC_CANDLES_ENDPOINT_THE_GRAPH is not defined'
}
if (!process.env.CHARTING_LIBRARY_USERNAME) {
  throw 'CHARTING_LIBRARY_USERNAME is not defined'
}
if (!process.env.CHARTING_LIBRARY_ACCESS_TOKEN) {
  throw 'CHARTING_LIBRARY_ACCESS_TOKEN is not defined'
}
if (!process.env.CHARTING_LIBRARY_REPOSITORY) {
  throw 'CHARTING_LIBRARY_REPOSITORY is not defined'
}
if (!process.env.NEXT_PUBLIC_PYTH_ENDPOINT) {
  throw 'NEXT_PUBLIC_PYTH_ENDPOINT is not defined'
}
if (!process.env.NEXT_PUBLIC_MAINNET_REST) {
  throw 'NEXT_PUBLIC_MAINNET_REST is not defined'
}
if (!process.env.NEXT_PUBLIC_RPC) {
  throw 'NEXT_PUBLIC_RPC is not defined'
}

console.log('✅ Required env variables set')
