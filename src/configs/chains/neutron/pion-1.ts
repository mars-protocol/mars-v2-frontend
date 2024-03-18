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
    redBank: 'neutron1v3kslntkhqlumu70wzru0ryg4j2atxv7wlqn2jah9r3e6vyhqzks5xytvf',
    incentives: 'neutron1kn8mcnzx29w36n692e7dk3w2yv4q09rlx0wz4gkly3kj92p3d65s68rv2c',
    oracle: 'neutron14v283q54e2c7r3jxpxw3nxc2pt8zmsfz0se03f3fxuxxeen2shlsxdq2zv',
    swapper: 'neutron1g9nun5h0fw8lwa0h62mcr7tm059yqxe8n66x6mrf4snpt874hp7qrrsrqa',
    params: 'neutron1m4pd2nmsqz37xngrn2ns6er9cv46xz8thesfkt64agx3t6nh408sk8feat',
    creditManager: 'neutron1m74ywvt3rfetj8m3u0yz275usfkwwngm33c53093kj3n7c8klrpqmqtxru',
    accountNft: 'neutron1t7xusf8t6n2nvn2ye6rxdrcle7zu65qf5dmpjcdvge8cqgch3j3qnnuvlg',
    perps: 'neutron16kg666yz026wvuk2crtz99wszqzc7t4aqxldx3nshlm8wtn6y28stpp6du',
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
