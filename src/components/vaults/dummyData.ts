// TODO: update once we know data structure
export const queuedWithdrawDummyData = [
  {
    unfreeze_date: '29 Jan 2024',
    unfreeze_time: '13:45',
    status: 'Queued',
    amount: '28386',
    shares: '383',
    totalPosition: '49342',
    walletAddress: '0x37gs8fksjksjuncgtyyd36xdsfgjjsfsfksfi',
  },
  {
    unfreeze_date: '2 Sep 2025',
    unfreeze_time: '11:20',
    status: 'Ready to withdraw',
    amount: '67999',
    shares: '3583',
    totalPosition: '112282',
    walletAddress: '0x37rdww8fksjksjuncgtyyd36xfsdsfgjjskssafi',
  },
  {
    unfreeze_date: '9 Feb 2025',
    unfreeze_time: '03:45',
    status: 'Ready to withdraw',
    amount: '2298765',
    shares: '1765',
    totalPosition: '974367',
    walletAddress: '0x37wr8fksjksjuncgtyyd36xcfefdsfdsfgjjskfgsdsi',
  },
]

export const vaultBalanceData = [
  {
    value: '1000',
    liquidationPrice: '950',
    apy: '5',
    asset: {
      symbol: 'USDC',
      name: 'USD Coin',
      logo: 'https://raw.githubusercontent.com/astroport-fi/astroport-token-lists/main/img/usdc.svg',
    },
  },
  {
    value: '500',
    liquidationPrice: '450',
    apy: '12.5',
    asset: {
      symbol: 'NTRN',
      name: 'Neutron',
      logo: 'https://raw.githubusercontent.com/astroport-fi/astroport-token-lists/main/img/neutron.svg',
    },
  },
]

export const vaultProfileData = {
  vaultName: 'Pepe Vault',
  apr: 48.5,
  tvl: 902274.47,
  accuredPnl: 202.45,
  wallet: 'Stargaze',
  description:
    "Welcome to the 'Get Rich or Die Tryin' crypto vault, where your USDC is about to hustle harder than 50 Cent in the early 2000s! I'm the fund manager, your crypto Dr. Dre, here to produce those sweet gains and turn your digital dollars into a symphony of wealth.",
  avatarUrl:
    'https://ichef.bbci.co.uk/ace/standard/976/cpsprodpb/16620/production/_91408619_55df76d5-2245-41c1-8031-07a4da3f313f.jpg',
}
