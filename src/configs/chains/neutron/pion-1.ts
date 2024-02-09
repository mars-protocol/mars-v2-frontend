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
    redBank: 'neutron1gpv59ff87mfvx8s3fn5ku3l8dn94fkj4q37sruhwfl0zzgjsejqs3xejyj',
    incentives: 'neutron1au78lscqqh77ghvl6eq2d58vy439q0gprhz0sc5q4r9svh63hquqtwlrsw',
    oracle: 'neutron1z44naqtpn20z5yws7updsgcplm7tcfkcn67uejvc0l7n8hy6vupq0894qs',
    swapper: 'neutron1td4dn53k7ythdj8ah3xv5p66swq3sy2a9jzq4yrue8aa4dvwacrs7dachf',
    params: 'neutron16l9j74q6ht9ycd37qxt6tz83l3r3cwec4qu9r5mkd66kcve23ywspjqhjp',
    creditManager: 'neutron1swud86k6acvpjfn68cv6tz3h7z72nz395d7y5e3yxknrc8yl9faqxn5jjw',
    accountNft: 'neutron1apus79ka5v30wmwdxzzapprrzxxw6mz0hc0uk3g030t0m5f0asuq8x3ldf',
    perps: 'neutron1ssnc38h40fu0d2et8f38z83ealgugh06r4anqa6dn6hlz6syqaqsmj6zcy',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t',
  },
  endpoints: {
    routes: 'https://app.astroport.fi/api/routes',
    rpc: process.env.NEXT_PUBLIC_NEUTRON_TEST_RPC ?? 'https://rpc-palvus.pion-1.ntrn.tech/',
    rest: process.env.NEXT_PUBLIC_NEUTRON_TEST_REST ?? 'https://rest-palvus.pion-1.ntrn.tech/',
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
      high: 0.04,
    },
  },
  features: ['ibc-transfer', 'ibc-go'],
  gasPrice: '0.025untrn',
  hls: false,
  perps: true,
  farm: false,
}

export default Pion1
