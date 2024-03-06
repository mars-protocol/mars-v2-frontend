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
    redBank: 'neutron190calx030x3mmmzwfx9gt6ne7jfkn64p9gfl052ayutc2qm668hsjepjmv',
    incentives: 'neutron1h48rzcufkzv57ke0qdlp5yp77nzca6rf4yl6k8xgummskzttyzlsa0qypx',
    oracle: 'neutron1vnvfa6tnyfm3zuagpxh9cjfdavdcqzx6mtqxuvg46q42y37jndsqz7u6nh',
    swapper: 'neutron1rha2nvskmlw654jkgwxptltqrcwwpwsadg6sxj5rgsnypcxga7xs2p79sl',
    params: 'neutron1er0nhljflg4kq5a95k4hlgrp8z7jsaldf5gy6a6zqwfezfeu37ws6hc6um',
    creditManager: 'neutron1u44ncq2e8n5u22rzlpgwv5n06z4lkv4vj2r7kd3xtd96jnr6u8nqnr4ag8',
    accountNft: 'neutron19egqmcakfjste99xddemfpqtpuz0y0dlkzmxyusc76aue90uugysx8vukd',
    perps: 'neutron1mzcjf8mfx8ejjn824hv6tqkxy3hzjt3wj99qwfuvlqc68g7s37asy7fley',
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
