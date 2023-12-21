import { Bech32Address } from '@keplr-wallet/cosmos'

import ATOM from 'configs/assets/ATOM'
import NTRN from 'configs/assets/NTRN'
import USDCaxl from 'configs/assets/USDC.axl'
import USDollar from 'configs/assets/USDollar'
import { ENV } from 'constants/env'
import { ChainInfoID } from 'types/enums/wallet'

const Pion1: ChainConfig = {
  assets: [
    { ...NTRN, denom: 'untrn' },
    { ...USDCaxl, denom: 'ibc/F91EA2C0A23697A1048E08C2F787E3A58AC6F706A1CD2257A504925158CFC0F3' },
    { ...ATOM, denom: 'ibc/C4CFF46FD6DE35CA4CF4CE031E643C8FDC9BA4B99AE598E9B0ED98FE3A2319F9' },
    USDollar,
  ],
  id: ChainInfoID.Pion1,
  name: 'Neutron Testnet',
  contracts: {
    redBank: 'neutron1s5scv6rgy4fnxvdgwk30jwnzrm5wwleg9q7aw36fp4quwmrwcupss6y8r9',
    incentives: 'neutron1fkkatnyqf4hfgxf75qdqargn77p2vn4xu4pautrd4665aut4wmfs0xqce9',
    oracle: 'neutron1g407aq6jl8h5uzgghtt2myt32xdql2mmfxqjf45vlwr03u393lkqvzh0h8',
    swapper: 'neutron1y868cxeqe8rcyvqa8rm878lupwymrha2eccv8ur4fr5ud08fsqrq8ezn2y',
    params: 'neutron1989ehz8htxtjw7f80avprkudvnwh83zczrk4y0uev2mmmkfy7ujsn8u4as',
    creditManager: 'neutron1l0lyr4a9fq2je2c437dlv5k3960um2xztssky3n8usllk9wa0fpssjsaz3',
    accountNft: 'neutron12wrdnp0edn7xqleak4khn265xrtkk732ext4d3yeyfz2gcup3e4scmmrj3',
    perps: 'neutron1d7mwvg3sjlqafqm0k44schngexxs9rxf38fvzqglzan6282hp0jsdswgx6',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t',
  },
  endpoints: {
    rest: ENV.PION1_REST || 'https://rest-palvus.pion-1.ntrn.tech/',
    rpc: ENV.PION1_RPC || 'https://rpc-palvus.pion-1.ntrn.tech/',
    swap: 'https://testnet-neutron.astroport.fi/swap',
    pyth: 'https://hermes.pyth.network/api',
    pythCandles: 'https://benchmarks.pyth.network',
    pools: '', //TODO: Implement this
    explorer: 'https://testnet.mintscan.io/neutron-testnet',
    aprs: {
      vaults: 'https://api.marsprotocol.io/v1/vaults/neutron',
      stride: 'https://edge.stride.zone/api/stake-stats',
    },
  },
  network: 'testnet',
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
  perps: false,
  farm: false,
}

export default Pion1
