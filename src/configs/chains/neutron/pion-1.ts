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
    redBank: 'neutron1rdu56hxmzzgtf6hdajmmvh4k7vn43evs3036h749d2skvz4u0drqdy2unn',
    incentives: 'neutron1qsr063a5vvjr2c4s0pdpk43fyy0uxwvp50pgwlvwzuxxv5hv0hzqrsg0rf',
    oracle: 'neutron14rxlnz07rckc5e34v4nt5k566h66pnuu0mtt7mttmwqc4xhfawlq2ua3n6',
    swapper: 'neutron18t9srnutkkp4yeh8z836ht7jn2x3ed6wm57rswk09wp8zrevl5ns6pyrqd',
    params: 'neutron1lsdpu7rljsy6wk83wjgv6d98zkz5c2t5lhyje94cxw0gj6x8kk6qlpcqym',
    creditManager: 'neutron13hz4xs7h26dcq0q68tm3qmfupvck3szh6nkzjx5yaqd2aupx84ysfkw34s',
    accountNft: 'neutron1seeluhjy02cl52h7ged3qgzddw78yc6fy2mkje8u9dtpq5xh6lksqpfss6',
    perps: 'neutron1qkkuctaws2qrrxd520hlq3jhgpc87a8fdvxjr2az454jl3s55jgqy3mfnc',
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
