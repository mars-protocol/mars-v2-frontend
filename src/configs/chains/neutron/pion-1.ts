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
    redBank: 'neutron1qutchyg620klaw8y2z8769gj4y2rkapzppwdzsy87fmtkhehlwzq5ej46w',
    incentives: 'neutron1tdl7jq26gsw55lynecsd29sh3r4zgnwdnyvy3gymutxsfn2q0sxsehyzy0',
    oracle: 'neutron15hrpvd44wr2pgja36apqrsjdcz5km7y4hszwucaal7zdlffmru3sp665c6',
    swapper: 'neutron1uxe7ydccxepzl9692che2yu8d90pq6js3s9wvzldnk3zcykfx6fsw0af9d',
    params: 'neutron17mwrqfa539na5k5glqg5xdjfng66dw23ggjt6fxytf00eycfjnvsl6m20l',
    creditManager: 'neutron104qkvlys7lxd5yamerwuxe869mm0fzkjtj6ynnjguu0ykhzr3vys4j6efx',
    accountNft: 'neutron1jajdlr86d4la2veal3j5sf2we7cqvx95ryx2w7ruz9q6uv0ghp5qh5y83s',
    perps: 'neutron1urteh3gzt7dcw35jt5jmfthf69xumqf3kv58ecs3k0m0rqxascqqzh6mhw',
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
