import { ChainInfoID, WalletID } from '@marsprotocol/wallet-connector'

const Assets: { [key: string]: Asset } = {
  osmo: {
    symbol: 'OSMO',
    name: 'Osmosis',
    denom: 'uosmo',
    color: '#9f1ab9',
    decimals: 6,
    hasOraclePrice: true,
    logo: '/tokens/osmo.svg',
  },
  atom: {
    symbol: 'ATOM',
    name: 'Atom',
    denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
    color: '#6f7390',
    logo: '/tokens/atom.svg',
    decimals: 6,
    hasOraclePrice: true,
  },
  cro: {
    symbol: 'CRO',
    name: 'Cronos',
    denom: 'ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1',
    color: '#002D74',
    logo: '/tokens/cro.svg',
    decimals: 8,
    hasOraclePrice: true,
  },
}

const OtherAssets: { [key: string]: OtherAsset } = {
  mars: {
    symbol: 'MARS',
    name: 'Mars',
    denom: 'ibc/EA3E1640F9B1532AB129A571203A0B9F789A7F14BB66E350DCBFA18E1A1931F0',
    //denom: 'ibc/1BF910A3C8A30C8E3331764FA0113B920AE14B913F487DF7E1989FD75EFE61FD'
    color: '#a03b45',
    logo: '/tokens/mars.svg',
    decimals: 6,
    hasOraclePrice: true,
    poolId: 601,
  },
}

export const networkConfig: NetworkConfig = {
  name: ChainInfoID.OsmosisTestnet,
  hiveUrl: 'https://testnet-osmosis-node.marsprotocol.io/XF32UOOU55CX/osmosis-hive-front/graphql',
  rpcUrl: 'https://testnet-osmosis-node.marsprotocol.io/XF32UOOU55CX/osmosis-rpc-front/',
  restUrl: 'https://testnet-osmosis-node.marsprotocol.io/XF32UOOU55CX/osmosis-lcd-front/',
  contracts: {
    accountNft: 'osmo1xpgx06z2c6zjk49feq75swgv78m6dvht6wramu2gltzjz5j959nq4hggxz',
    mockVault: 'osmo1yqgjaehalz0pv5j22fdnaaekuprlggd7hth8m66jmdxe58ztqs4sjqtrlk',
    marsOracleAdapter: 'osmo1tlad2hj9rm7az7atx2qq8pdpl2007hrhpzua42j8wgxr0kc0ct4sahuyh7',
    swapper: 'osmo15kxcpvjaqlrj8ezecnghf2qs2x87veqx0fcemye0jpdr8jq7qkvsnyvuuf',
    mockZapper: 'osmo1axad429tgnvzvfax08s4ytmf7ndg0f9z4jy355zyh4m6nasgtnzs5aw8u7',
    creditManager: 'osmo169xhpftsee275j3cjudj6qfzdpfp8sdllgeeprud4ynwr4sj6m4qel2ezp',
    redBank: 'osmo1g30recyv8pfy3qd4qn3dn7plc0rn5z68y5gn32j39e96tjhthzxsw3uvvu',
    oracle: 'osmo1dqz2u3c8rs5e7w5fnchsr2mpzzsxew69wtdy0aq4jsd76w7upmsstqe0s8',
  },
  assets: {
    base: Assets.osmo,
    whitelist: [Assets.osmo, Assets.atom, Assets.cro],
    other: [OtherAssets.mars],
  },
  appUrl: 'https://testnet.osmosis.zone',
  wallets: [WalletID.Keplr, WalletID.Leap, WalletID.Cosmostation],
}
