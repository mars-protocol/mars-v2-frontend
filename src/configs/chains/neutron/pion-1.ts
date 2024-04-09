import { Bech32Address } from '@keplr-wallet/cosmos'

import ATOM from 'configs/assets/ATOM'
import NTRN from 'configs/assets/NTRN'
import USDC from 'configs/assets/USDC'
import USDollar from 'configs/assets/USDollar'
import { NETWORK } from 'types/enums/network'
import { ChainInfoID } from 'types/enums/wallet'

const Pion1: ChainConfig = {
  assets: [
    { ...NTRN, denom: 'untrn', isPerpsEnabled: true },
    { ...USDC, denom: 'ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42' },
    {
      ...ATOM,
      denom: 'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9',
      isPerpsEnabled: true,
    },
    USDollar,
  ],
  id: ChainInfoID.Pion1,
  name: 'Neutron Testnet',
  contracts: {
    redBank: 'neutron12rx9thljvu8z3lhw8j3gu6jffkkmq7rr52q5cufw453en65g3u9q8mvt9t',
    incentives: 'neutron1n6zfmmfcjd0t9yq8smm3c56rry43y7stycyyyl3zm8df8wxzdf2sxgfe3j',
    oracle: 'neutron1cvaq4mw2hfcvkl98hx0n8y4krmtn2wgdwmsy7w2869zapyxr5easdhqvqv',
    swapper: 'neutron1s2lgrac6ty5yq73m9l8e6upy3u2u03s689lwz3ajy40wg8emw6lsgxsxqx',
    params: 'neutron1gfjdxta4gjjh6u465h23u4aazuzt6l0qnlrprcsq90cunxq5s2uskgpt2e',
    creditManager: 'neutron1gf7wp3897909eplj3n49px8hjgkj4dp4fnsd7830vtrarj3lc5vqdkwg3h',
    accountNft: 'neutron1x2rvwneemz5zdky5q06wsdrctsa5a3jrc6tcrew526kzfdgekhzqektzza',
    perps: 'neutron1n6yzylpjsj8gvykrp4gnv478p85z07ngw8f47rau6pcd3rm4892s4d5mxf',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t',
  },
  endpoints: {
    routes: 'https://app.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? 'https://rpc-palvus.pion-1.ntrn.tech',
    rest: process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-palvus.pion-1.ntrn.tech',
    swap: 'https://testnet-neutron.astroport.fi/swap',
    pools: '', //TODO: ⛓️ Implement this
    explorer: 'https://www.mintscan.io/neutron-testnet',
    aprs: {
      vaults: 'https://api.marsprotocol.io/v1/vaults/neutron',
      stride: 'https://edge.stride.zone/api/stake-stats',
    },
  },
  network: NETWORK.TESTNET,
  vaults: [],
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
  perps: true,
  farm: false,
}

export default Pion1
