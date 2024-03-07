import { Bech32Address } from '@keplr-wallet/cosmos'

import ATOM from 'configs/assets/ATOM'
import NTRN from 'configs/assets/NTRN'
import USDCaxl from 'configs/assets/USDC.axl'
import USDollar from 'configs/assets/USDollar'
import { NETWORK } from 'types/enums/network'
import { ChainInfoID } from 'types/enums/wallet'

const Pion1: ChainConfig = {
  assets: [
    { ...NTRN, denom: 'untrn', isPerpsEnabled: true },
    { ...USDCaxl, denom: 'ibc/F91EA2C0A23697A1048E08C2F787E3A58AC6F706A1CD2257A504925158CFC0F3' },
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
    redBank: 'neutron1h7lvw8nm64x3zxlue6ec3vrk4e504d7c2wqq6y9uq2nu2shygh8qxm22up',
    incentives: 'neutron1e28g4d93rthgjrtrxsze2f5lcljsxst24szhx0gjsvcmwzqsdruswau7hv',
    oracle: 'neutron1lwwmygj9cfm5jy623vvk37athq5fnjnm00wfjap2q49lfk8wylkqtujcym',
    swapper: 'neutron1yk90r8efz897ev7vve9anfl4w342czn8f35qlyd3s2hsg4tctdms7vwexp',
    params: 'neutron16kqg3hr2qc36gz2wqvdzsctatkmzd3ss5gc07tnj6u3n5ajw89asrx8hfp',
    creditManager: 'neutron1kj50g96c86nu7jmy5y7uy5cyjanntgru0eekmwz2qcmyyvx6383s8dgvm6',
    accountNft: 'neutron17wvpxdc3k37054ume0ga4r0r6ra2rpfe622m0ecgd9s7xd5s0qusspc4ct',
    perps: 'neutron14v9g7regs90qvful7djcajsvrfep5pg9qau7qm6wya6c2lzcpnms692dlt',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t',
  },
  endpoints: {
    routes: 'https://app.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? 'https://rpc-palvus.pion-1.ntrn.tech',
    rest: process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-palvus.pion-1.ntrn.tech',
    swap: 'https://testnet-neutron.astroport.fi/swap',
    pools: '', //TODO: ⛓️ Implement this
    explorer: 'https://testnet.mintscan.io/neutron-testnet',
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
      average: 0.015,
      high: 0.025,
    },
  },
  features: ['ibc-transfer', 'ibc-go'],
  gasPrice: '0.015untrn',
  hls: false,
  perps: true,
  farm: false,
}

export default Pion1
