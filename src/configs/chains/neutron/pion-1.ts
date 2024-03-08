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
    redBank: 'neutron1yzazm4e697mgjjsuepl8gr6yyuuxff2nwzfgg3nlxctavvt7f8pqr424cz',
    incentives: 'neutron1cywvc60yylwkjzh3zm5ftfmuxra5hcq4xe7q00see04an7udvddsy2xl37',
    oracle: 'neutron1j5mz5scmx2ezmch3qzxx0xpvsyw2alxv5k7xs0v20m64p5qmvtqsn00rz5',
    swapper: 'neutron1383ytqh0l39vmml2a8m6etwueet4d8fs5h9h48mkjkftn7wtyrhsjya838',
    params: 'neutron1gwplf5cxzkug5jufl228m8tqtd3tc089ds9zptpl4y7y623lr3zst8wpg0',
    creditManager: 'neutron1v4qz5w6n09la2f9uutkvyklutas9g3cd9rqhdcappajavrv4d6xqzuvnrv',
    accountNft: 'neutron10ps7kpw7x78fx2t3uy58henttna8t750tp2s6tjn4tuk0jadp7csytk9yx',
    perps: 'neutron1he5f7ch3e9mze39pl95fl4ljszk7wd8lg3ungay5lq4hpj8lq4yqp4y3xj',
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
