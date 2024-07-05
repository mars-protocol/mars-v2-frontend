import { Bech32Address } from '@keplr-wallet/cosmos'

import { ChainInfoID, NETWORK } from 'types/enums'

const Pion1: ChainConfig = {
  id: ChainInfoID.Pion1,
  name: 'Neutron Testnet',
  stables: ['ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42'],
  defaultTradingPair: {
    buy: 'untrn',
    sell: 'ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42',
  },
  contracts: {
    redBank: 'neutron1ka6fmyj2e46szv3nzg7xs0t08uja0ra5jyvjfvryyx2selnm00vse6n4n2',
    incentives: 'neutron1q3n9cmrsv62v9t2k0zjfr6xaex82cr93xj0sx3j6ur9hsnj7n3wqxe5pmv',
    oracle: 'neutron14nklvm2ncnnmnzf3zlpkz5krt0aqheucnljjx82j06s9h559s0qsecnk9y',
    params: 'neutron1kgcmwwu76vqdsy8jwx6e5s6l8982eyj05ghgqhuuw20rzv44a4ws3y4284',
    creditManager: 'neutron1gxg9ld2n4g0gg8w77e9xl22xdfgyj26mhj6cqc8pnlsx5jxum88srxwu9c',
    accountNft: 'neutron1qwz2fkt4y4u2nmh30cmjeh60pw4rq2pap3lapf76rm6mlksnevts9lm0yv',
    perps: 'neutron15rrd66vwdcvphat369jgey7z03ugyavdfhp8e7r5m40sy4mnzudsxfsnm8',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t',
  },
  endpoints: {
    routes: 'https://testnet.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? 'https://rpc-palvus.pion-1.ntrn.tech',
    rest: process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-palvus.pion-1.ntrn.tech',
    swap: 'https://testnet-neutron.astroport.fi/swap',
    explorer: 'https://www.mintscan.io/neutron-testnet',
    dexAssets: 'https://testnet.astroport.fi/api/tokens?chainId=pion-1',
    dexPools: 'https://testnet.astroport.fi/api/pools?chainId=pion-1',
    aprs: {
      vaults: '',
      stride: 'https://edge.stride.zone/api/stake-stats',
    },
  },
  network: NETWORK.TESTNET,
  vaults: [],
  dexName: 'Astroport',
  explorerName: 'Mintscan',
  bech32Config: Bech32Address.defaultBech32Config('neutron'),
  defaultCurrency: {
    coinDenom: 'NTRN',
    coinMinimalDenom: 'untrn',
    coinDecimals: 6,
    coinGeckoId: 'neutron',
    gasPriceStep: {
      low: 0,
      average: 0.025,
      high: 0.045,
    },
  },
  features: ['ibc-transfer', 'ibc-go'],
  gasPrice: '0.025untrn',
  hls: false,
  perps: false,
  farm: true,
  anyAsset: true,
}

export default Pion1
