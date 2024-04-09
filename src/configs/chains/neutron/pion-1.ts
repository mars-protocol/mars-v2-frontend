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
    redBank: 'neutron1lqlyyvg6tupm6xugs2pap6wrkw0qt4930v6deme30xky5ac8ux0q7h80sw',
    incentives: 'neutron1c6pr2wstwtal0qzqrw8ejtgqle82c593k9ypsyqhavngp8tage7qtctrag',
    oracle: 'neutron1wwgrwnsf0jlkfrc5z8yld2gw0ujsu768790qwdd76u6sqnxdejjsatjdru',
    swapper: 'neutron1dmasv53dx3czffev7xgjtn7lxku4hrg0ln93nutyexcxagljdmpsjgq0x0',
    params: 'neutron19sjjh8vp54qkvets5ld237swjefyjz2nm698c52kqas5806k6q9sypv5vm',
    creditManager: 'neutron1heqptyzcvgn3q6h8drzzxcq9k0skcy08zxs292ralnze768ql2jqmtuyhm',
    accountNft: 'neutron1wp740dgud6rcxahqremcpewzgrwap0uj7paq2vccczwz6je24kvsw60et5',
    perps: 'neutron17zkluzgj82syvdpszc0gv24vw0dezvtw35e2k0jnk3ngeljkja3s87dsfs',
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
