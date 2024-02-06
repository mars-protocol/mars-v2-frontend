require('dotenv').config({ path: './.env.local' })

if (!process.env.NEXT_PUBLIC_NETWORK) {
  throw 'NEXT_PUBLIC_NETWORK is not defined. Set ot to "mainnet" or "testnet".'
}
if (!process.env.NEXT_PUBLIC_WALLET_CONNECT_ID) {
  throw 'NEXT_PUBLIC_WALLET_CONNECT_ID is not defined. Get a WalletConnect project ID from https://walletconnect.com/.'
}

console.log('✅ Required env variables set')
