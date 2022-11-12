type Token = {
  symbol: string
  decimals: number
  icon: string
  chain: string
}

const tokenInfo: { [key in string]: Token } = {
  uosmo: {
    symbol: 'OSMO',
    decimals: 6,
    icon: '/tokens/osmo.svg',
    chain: 'Osmosis',
  },
  'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2': {
    symbol: 'ATOM',
    icon: '/tokens/atom.svg',
    decimals: 6,
    chain: 'Cosmos',
  },
  'ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1': {
    symbol: 'CRO',
    icon: '/tokens/cro.jpg',
    decimals: 8,
    chain: 'Crypto.org',
  },
}

export default tokenInfo
