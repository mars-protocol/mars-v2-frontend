import { Bech32Address } from '@keplr-wallet/cosmos'

import ATOM from 'configs/assets/ATOM'
import DYDX from 'configs/assets/DYDX'
import NTRN from 'configs/assets/NTRN'
import USDCaxl from 'configs/assets/USDC.axl'
import USDollar from 'configs/assets/USDollar'
import WETHaxl from 'configs/assets/WETH.axl'
import stATOM from 'configs/assets/stATOM'
import stkATOM from 'configs/assets/stkATOM'
import wstETH from 'configs/assets/wstETH'
import { NETWORK } from 'types/enums/network'
import { ChainInfoID } from 'types/enums/wallet'

const Neutron1: ChainConfig = {
  assets: [
    { ...NTRN, denom: 'untrn' },
    { ...USDCaxl, denom: 'ibc/F082B65C88E4B6D5EF1DB243CDA1D331D002759E938A0F5CD3FFDC5D53B3E349' },
    {
      ...ATOM,
      denom: 'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9',
    },
    {
      ...stATOM,
      denom: 'ibc/B7864B03E1B9FD4F049243E92ABD691586F682137037A9F3FCA5222815620B3C',
    },
    {
      ...stkATOM,
      denom: 'ibc/3649CE0C8A2C79048D8C6F31FF18FA69C9BC7EB193512E0BD03B733011290445',
    },
    { ...WETHaxl, denom: 'ibc/A585C2D15DCD3B010849B453A2CFCB5E213208A5AB665691792684C26274304D' },
    {
      ...wstETH,
      denom: 'factory/neutron1ug740qrkquxzrk2hh29qrlx3sktkfml3je7juusc2te7xmvsscns0n2wry/wstETH',
    },
    { ...DYDX, denom: 'ibc/2CB87BCE0937B1D1DFCEE79BE4501AAF3C265E923509AEAC410AD85D27F35130' },
    USDollar,
  ],
  id: ChainInfoID.Neutron1,
  name: 'Neutron',
  contracts: {
    redBank: 'neutron12rx9thljvu8z3lhw8j3gu6jffkkmq7rr52q5cufw453en65g3u9q8mvt9t',
    incentives: 'neutron1n6zfmmfcjd0t9yq8smm3c56rry43y7stycyyyl3zm8df8wxzdf2sxgfe3j',
    oracle: 'neutron1cvaq4mw2hfcvkl98hx0n8y4krmtn2wgdwmsy7w2869zapyxr5easdhqvqv',
    swapper: 'neutron1s2lgrac6ty5yq73m9l8e6upy3u2u03s689lwz3ajy40wg8emw6lsgxsxqx',
    params: 'neutron1gfjdxta4gjjh6u465h23u4aazuzt6l0qnlrprcsq90cunxq5s2uskgpt2e',
    creditManager: 'neutron1gf7wp3897909eplj3n49px8hjgkj4dp4fnsd7830vtrarj3lc5vqdkwg3h',
    accountNft: 'neutron1x2rvwneemz5zdky5q06wsdrctsa5a3jrc6tcrew526kzfdgekhzqektzza',
    perps: 'neutron1n6yzylpjsj8gvykrp4gnv478p85z07ngw8f47rau6pcd3rm4892s4d5mxf',
    pyth: 'neutron1m2emc93m9gpwgsrsf2vylv9xvgqh654630v7dfrhrkmr5slly53spg85wv',
  },
  endpoints: {
    routes: 'https://app.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_RPC ?? 'https://rpc-kralum.neutron-1.neutron.org',
    rest: process.env.NEXT_PUBLIC_NEUTRON_REST ?? 'https://rest-kralum.neutron-1.neutron.org',
    swap: 'https://neutron.astroport.fi/swap',
    pools: '', //TODO: ⛓️ Implement this
    explorer: 'https://mintscan.io/neutron',
    aprs: {
      vaults: 'https://api.marsprotocol.io/v1/vaults/neutron',
      stride: 'https://edge.stride.zone/api/stake-stats',
    },
  },
  network: NETWORK.MAINNET,
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
      average: 0.015,
      high: 0.025,
    },
  },
  features: ['ibc-transfer', 'ibc-go'],
  gasPrice: '0.015untrn',
  hls: false,
  perps: false,
  farm: false,
}

export default Neutron1
