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
    redBank: 'neutron1s2vxnxqqjtjekenqmf46467anmz4ee40xz04a0qy743cq040nu6shzfhc2',
    incentives: 'neutron1sjhccp8mghedeepeshcmap677l4ytre589ucyep74jnyf4m6hyrqvy5vzd',
    oracle: 'neutron1qmkkhu2v6yzhqd2g6jlkegachpmvyzrg2355h0djw2eac5cscp7q83ce3u',
    swapper: 'neutron1zqhs7txm744466zd4vf9gznp8g2m4yyd28qcymeqpn65mmrj2r4sxlednd',
    params: 'neutron137u6mnz7jc7ums5a3efspz3mejas2wut5auuw8ln2pj4t9awhv6sav9ftn',
    creditManager: 'neutron1psu5z8c4359mz0dpgxzqgxpzfhjgjranktglfv42v5jkt8p56e9syc9nt5',
    accountNft: 'neutron1nt0e3p5u7rgukawvha0yfcwl9ytzp3qxjqs4shfkd74r77sw75rq5m0de4',
    perps: 'neutron15rrd66vwdcvphat369jgey7z03ugyavdfhp8e7r5m40sy4mnzudsxfsnm8',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t',
  },
  endpoints: {
    routes: 'https://app.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? 'https://rpc-palvus.pion-1.ntrn.tech',
    rest: process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-palvus.pion-1.ntrn.tech',
    swap: 'https://testnet-neutron.astroport.fi/swap',
    pools: '', //TODO: ⛓️ Implement this
    explorer: 'https://www.mintscan.io/neutron-testnet',
    dexAssets: 'https://testnet.astroport.fi/api/tokens?chainId=pion-1',
    dexPools: 'https://testnet.astroport.fi/api/pools?chainId=pion-1',
    aprs: {
      vaults: 'https://api.marsprotocol.io/v1/vaults/neutron',
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
  farm: false,
  anyAsset: true,
}

export default Pion1
