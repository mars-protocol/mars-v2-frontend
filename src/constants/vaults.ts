export const VAULTS: VaultMetaData[] = [
  {
    address: 'osmo108q2krqr0y9g0rtesenvsw68sap2xefelwwjs0wedyvdl0cmrntqvllfjk',
    name: 'OSMO-ATOM',
    lockup: {
      duration: 14,
      timeframe: 'day',
    },
    provider: 'Apollo',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2',
      lp: 'gamm/pool/1',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'ATOM',
    },
  },
  {
    address: 'osmo1g5hryv0gp9dzlchkp3yxk8fmcf5asjun6cxkvyffetqzkwmvy75qfmeq3f',
    name: 'OSMO - JUNO',
    lockup: {
      duration: 14,
      timeframe: 'day',
    },
    provider: 'Apollo',
    denoms: {
      primary: 'uosmo',
      secondary: 'ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED',
      lp: 'gamm/pool/497',
    },
    symbols: {
      primary: 'OSMO',
      secondary: 'JUNO',
    },
  },
]
