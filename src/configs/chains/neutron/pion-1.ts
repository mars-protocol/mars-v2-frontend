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
    redBank: 'neutron1nf853c9a86qt76hqd8wkmmw34e37q9yvteyhk9r83z7tc74v2y6squmm3n',
    incentives: 'neutron1hvvmd2s7e4y89j2qukmgsng2n6vmu22cdekse8xnhkltr6646gqsepkhyx',
    oracle: 'neutron15yeemqup6w46qvd60kv0tm965usvcluhrkc50urzetdnhvek7zwsyekm93',
    swapper: 'neutron1kwjd7malh7xxk6jk9v7rynl3hnurwjatpapsfkupkjgsgesf7nhsrqxusa',
    params: 'neutron139dswf05fl65aezssu9fdyfs2m0fg7dp06qmqa90jt56pzqw42jqgnhnwn',
    creditManager: 'neutron1pn5xdjv8zzw48h9m5zfu89h7cx7hnxldhhrq7tpzh0jwm568vgms9yamxa',
    accountNft: 'neutron14pahw7e2fm07ge968t4gt6tzueqgck4ksp0xnfrdcpk6kvnrmceqc57jl5',
    perps: 'neutron1p8xukszg0gr9nfnp06z6ara7ygp2de8lc2u6vwal8rf9827yf3usqctrd2',
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
