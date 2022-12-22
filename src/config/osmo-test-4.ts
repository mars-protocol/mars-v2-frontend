import { ChainInfoID } from '@marsprotocol/wallet-connector'
import mars from 'images/tokens/mars.svg'

import atom from 'images/tokens/atom.svg'
import cro from 'images/tokens/cro.svg'
import osmo from 'images/tokens/osmo.svg'

const Assets: { [key: string]: Asset } = {
  osmo: {
    symbol: 'OSMO',
    name: 'Osmosis',
    denom: 'uosmo',
    color: '#9f1ab9',
    decimals: 6,
    hasOraclePrice: true,
    logo: osmo,
  },
  atom: {
    symbol: 'ATOM',
    name: 'Atom',
    denom: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
    color: '#6f7390',
    logo: atom,
    decimals: 6,
    hasOraclePrice: true,
  },
  cro: {
    symbol: 'CRO',
    name: 'Cronos',
    denom: 'ibc/E6931F78057F7CC5DA0FD6CEF82FF39373A6E0452BF1FD76910B93292CF356C1',
    color: '#002D74',
    logo: cro,
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
    logo: mars,
    decimals: 6,
    hasOraclePrice: true,
    poolId: 601,
  },
}

export const networkConfig: NetworkConfig = {
  name: ChainInfoID.OsmosisTestnet,
  hiveUrl: 'https://osmosis-delphi-testnet-1.simply-vc.com.mt/XF32UOOU55CX/osmosis-hive/graphql',
  rpcUrl: 'https://osmosis-delphi-testnet-1.simply-vc.com.mt/XF32UOOU55CX/osmosis-rpc',
  restUrl: 'https://osmosis-delphi-testnet-1.simply-vc.com.mt/XF32UOOU55CX/osmosis-lcd',
  contracts: {
    accountNft: 'osmo1xvne7u9svgy9vtqtqnaet4nvn8zcpp984zzrlezfzgk4798tps8srkf5wa',
    mockVault: 'osmo1yqgjaehalz0pv5j22fdnaaekuprlggd7hth8m66jmdxe58ztqs4sjqtrlk',
    marsOracleAdapter: 'osmo1tlad2hj9rm7az7atx2qq8pdpl2007hrhpzua42j8wgxr0kc0ct4sahuyh7',
    swapper: 'osmo15kxcpvjaqlrj8ezecnghf2qs2x87veqx0fcemye0jpdr8jq7qkvsnyvuuf',
    mockZapper: 'osmo1axad429tgnvzvfax08s4ytmf7ndg0f9z4jy355zyh4m6nasgtnzs5aw8u7',
    creditManager: 'osmo1krz37p6xkkyu0f240enyt4ccxk7ds69kfgc5pnldsmpmmuvn3vpsnmpjaf',
    redBank: 'osmo1g30recyv8pfy3qd4qn3dn7plc0rn5z68y5gn32j39e96tjhthzxsw3uvvu',
    oracle: 'osmo1hkkx42777dyfz7wc8acjjhfdh9x2ugcjvdt7shtft6ha9cn420cquz3u3j',
  },
  assets: {
    base: Assets.osmo,
    whitelist: [Assets.osmo, Assets.atom],
    other: [OtherAssets.mars],
  },
  appUrl: 'https://testnet.osmosis.zone',
}
