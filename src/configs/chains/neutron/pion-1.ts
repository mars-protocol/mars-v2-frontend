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
    redBank: 'neutron1yu70fde3lw5zg03ejznkmy3pwgxja8s7f82uyeltp529hhwzl97sj8umgq',
    incentives: 'neutron1zellqn3yqzn7gvhyhlwsz29d844z99vp5hl0qjdmnlsd94ln3y3swvht67',
    oracle: 'neutron1gsff7syyrtaxpzlu4x92havhth5xd5ffl9qv5zu2nap78w7g9hzsh8ast0',
    swapper: 'neutron1s6j25phv4t6uxfcnrf0e9flltl9q24tds309wyzju340tj5hyzhsvxn6fw',
    params: 'neutron1skddf7y8ja2w0ay0rk86ze5jdwxmgzx3qj79p9f000cc2yyxx83sa9en9h',
    creditManager: 'neutron1tcquuh8jhqjcch3qryg2n7nupz0u74a2kfh0h7pyp0l5k65arzasp7yscx',
    accountNft: 'neutron1zn6cg37l6gveau9xwm3t8xet9lhkcftg2kl8skw908carwjmmvxqekzq7q',
    perps: 'neutron1e5rpysxlg2702lzcspj9vj4pukdkwmz9hphaarg0up24z8q3en7qe0dxc7',
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
