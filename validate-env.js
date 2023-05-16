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
if (!process.env.NEXT_PUBLIC_APOLLO_APR) {
  throw 'NEXT_PUBLIC_APOLLO_APR is not defined'
}
if (!process.env.NEXT_PUBLIC_RPC) {
  throw 'NEXT_PUBLIC_RPC is not defined'
} else {
  console.log('✅ Required env variables set')
}
