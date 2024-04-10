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
    redBank: 'neutron1pwtwcfdaptpvm226k2lzr5k9l2s6hgdrwaav0pc2vga0uvdt6ccsuld5x5',
    incentives: 'neutron10kumjpdxwqfymz8geuvp328hqrjcd0ac5ruwctxwdwmt6l53ekrs85rvsv',
    oracle: 'neutron1ldp4h8jfu53ppqsf2kgfj39hawkte994wr6y88z0nwp7wxmh9w6sh63kl8',
    swapper: 'neutron160q67kqems2qejapnqjf9ten09p0grthpr8qvjheuju5pacmmglqa8jhw2',
    params: 'neutron1czg9gwy4wqj54aaf4pdxttjw87pcwcrw859t07e9xz42rrjfhemq0l7u78',
    creditManager: 'neutron1g77y2r74d9zhvu4ttc3w0nszxc9wxsy7uzc6f32lxpeuascgx24qz4p6zx',
    accountNft: 'neutron14rjvpanqdm0j7ewfu8g5vqv0acfreuhp9rt2pw28cfy87a466lpqw207ez',
    perps: 'neutron186qk9zs2ye8ws498dnykk6e0vgh27skvxe70u0us5gk2jw6mfk8qj46tx8',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t'
  },
  endpoints: {
    routes: 'https://testnet.astroport.fi/api/routes',
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
  vaults: [
    {
      address: 'neutron1jvx3unsq0fsaf7smdefzz7wah437mhnl2paaquc4jzaj2vzefa2qteklve',
      denoms: {
        primary: 'ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42',
        secondary: 'untrn',
        lp: '',
        vault: 'factory/neutron1jvx3unsq0fsaf7smdefzz7wah437mhnl2paaquc4jzaj2vzefa2qteklve/vusdc',
      },
      name: 'Perps Funding Rate Bot',
      provider: 'Mars Wif Bots',
      lockup: {
        duration: 5,
        timeframe: 'days',
      },
      symbols: {
        primary: 'USDC',
        secondary: '',
      },
    },
  ],
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
  managedVault: {
    codeId: 4316,
    baseToken: 'ibc/4C19E7EC06C1AB2EC2D70C6855FEB6D48E9CE174913991DA0A517D21978E7E42',
    vaultTokenSubdenom: 'uUSDv'
  },
  features: ['ibc-transfer', 'ibc-go'],
  gasPrice: '0.025untrn',
  hls: false,
  perps: true,
  farm: false,
}

export default Pion1
