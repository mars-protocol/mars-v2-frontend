import { Bech32Address } from '@keplr-wallet/cosmos'

import { ChainInfoID, NETWORK } from 'types/enums'
import ATOM from 'configs/assets/ATOM'
import DYDX from 'configs/assets/DYDX'
import NTRN from 'configs/assets/NTRN'
import USDCaxl from 'configs/assets/USDC.axl'
import USDollar from 'configs/assets/USDollar'
import WETHaxl from 'configs/assets/WETH.axl'
import stATOM from 'configs/assets/stATOM'
import stkATOM from 'configs/assets/stkATOM'
import wstETH from 'configs/assets/wstETH'

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
    redBank: 'neutron1n97wnm7q6d2hrcna3rqlnyqw2we6k0l8uqvmyqq6gsml92epdu7quugyph',
    incentives: 'neutron1aszpdh35zsaz0yj80mz7f5dtl9zq5jfl8hgm094y0j0vsychfekqxhzd39',
    oracle: 'neutron1dwp6m7pdrz6rnhdyrx5ha0acsduydqcpzkylvfgspsz60pj2agxqaqrr7g',
    swapper: 'neutron1udr9fc3kd743dezrj38v2ac74pxxr6qsx4xt4nfpcfczgw52rvyqyjp5au',
    params: 'neutron16kqg3hr2qc36gz2wqvdzsctatkmzd3ss5gc07tnj6u3n5ajw89asrx8hfp',
    creditManager: 'neutron1kj50g96c86nu7jmy5y7uy5cyjanntgru0eekmwz2qcmyyvx6383s8dgvm6',
    accountNft: 'neutron17wvpxdc3k37054ume0ga4r0r6ra2rpfe622m0ecgd9s7xd5s0qusspc4ct',
    perps: 'neutron14v9g7regs90qvful7djcajsvrfep5pg9qau7qm6wya6c2lzcpnms692dlt',
    pyth: 'neutron1m2emc93m9gpwgsrsf2vylv9xvgqh654630v7dfrhrkmr5slly53spg85wv',
  },
  endpoints: {
    routes: 'https://app.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_RPC ?? 'https://rpc-kralum.neutron-1.neutron.org',
    rest: process.env.NEXT_PUBLIC_NEUTRON_REST ?? 'https://rest-kralum.neutron-1.neutron.org',
    swap: 'https://neutron.astroport.fi/swap',
    pools: '', //TODO: ⛓️ Implement this
    explorer: 'https://mintscan.io/neutron',
    anyAsset: 'https://app.astroport.fi/api/trpc/tokens.getAll',
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
  anyAsset: true,
}

export default Neutron1
