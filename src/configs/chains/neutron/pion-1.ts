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
    redBank: 'neutron1u3fmnnd3q9dkx2sccjgs2hfdp7sndkw5f37ug64zj0zgdm6dgjxq4njrnc',
    incentives: 'neutron18ere5chtsdswna8re75sldzhw0ccrmuff57cfh63060dnvflqswsxpzlm9',
    oracle: 'neutron1nua7c2esr5d8f6jfkylsd4pjywwlf0snj8gtxkp6k6f5jxa32hxqq2lcm7',
    swapper: 'neutron1me0pspfhkphe2mw7ja2f2fqnh0z5x30jj5t80jgd7p6y9swwk06snh7mun',
    params: 'neutron1ku3eccj8a49atmgkv4g8r2zgy62l93xy224ls44lfvdexh5xfqds97rrz3',
    creditManager: 'neutron1zjuschuar2e9cugj84hmun4r93mzkan6qy4x4ee5geguh3lmrdnsnq5s9z',
    accountNft: 'neutron12wrdnp0edn7xqleak4khn265xrtkk732ext4d3yeyfz2gcup3e4scmmrj3',
    perps: 'neutron1zlj4l4h55wmrctm3ete6sqjvucujgcpa7r9m0ex6pcgdngaqa0pss93jla',
    pyth: 'neutron15ldst8t80982akgr8w8ekcytejzkmfpgdkeq4xgtge48qs7435jqp87u3t',
  },
  endpoints: {
    rest: 'https://rest-palvus.pion-1.ntrn.tech/',
    rpc: 'https://rpc-palvus.pion-1.ntrn.tech/',
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
