export const vaultsOfficialDummyData: VaultData[] = [
  {
    vault_address: 'neutron17pew0epacxa4udp8umjgrja8xljz03jle92ed8klgvp8alwx28uqf3z0f8',
    name: 'MARS Vault 1',
    subtitle: 'Via Mars Protocol',
    tvl: '150000',
    apr: '0.20',
    fee: '0.03',
    fee_rate: '0.000046',
    freezePeriod: '24',
  },
  {
    vault_address: 'neutron1ulw0kg7d90wuvc8gu5h8hfmnc977hnr5datqc0n6devsujgey4gq2c47a0',
    name: 'MARS Vault 2',
    subtitle: 'Via Mars Protocol',
    tvl: '540000',
    apr: '0.30',
    fee: '0.04',
    fee_rate: '0.000046',
    freezePeriod: '48',
  },
  {
    vault_address: 'neutron17pew0epacxa4udp8umjgrja8xljz03jle92ed8klgvp8alwx28uqf3z0f8',
    name: 'MARS Vault 3',
    subtitle: 'Via Mars Protocol',
    tvl: '654777',
    apr: '0.45',
    fee: '0.06',
    fee_rate: '0.000046',
    freezePeriod: '24',
  },
  {
    vault_address: 'neutron1ulw0kg7d90wuvc8gu5h8hfmnc977hnr5datqc0n6devsujgey4gq2c47a0',
    name: 'MARS Vault 4',
    subtitle: 'Via Mars Protocol',
    tvl: '1200000',
    apr: '0.35',
    fee: '0.01',
    fee_rate: '0.000046',
    freezePeriod: '72',
  },
]

export const vaultsCommunityDummyData: VaultData[] = [
  {
    vault_address: 'neutron17pew0epacxa4udp8umjgrja8xljz03jle92ed8klgvp8alwx28uqf3z0f8',
    name: 'Vault 1',
    subtitle: 'RebelBots',
    tvl: '150000',
    apr: '0.20',
    fee: '0.03',
    fee_rate: '0.000046',
    freezePeriod: '24',
  },
  {
    vault_address: 'neutron1ulw0kg7d90wuvc8gu5h8hfmnc977hnr5datqc0n6devsujgey4gq2c47a0',
    name: 'Vault 2',
    subtitle: 'DefiSaver',
    tvl: '540000',
    apr: '0.30',
    fee: '0.04',
    fee_rate: '0.000046',
    freezePeriod: '24',
  },
  {
    vault_address: 'neutron17pew0epacxa4udp8umjgrja8xljz03jle92ed8klgvp8alwx28uqf3z0f8',
    name: 'Vault 3',
    subtitle: 'CryptoLegends',
    tvl: '654777',
    apr: '0.45',
    fee: '0.06',
    fee_rate: '0.000046',
    freezePeriod: '48',
  },
  {
    vault_address: 'neutron1ulw0kg7d90wuvc8gu5h8hfmnc977hnr5datqc0n6devsujgey4gq2c47a0',
    name: 'Vault 4',
    subtitle: 'wagmi',
    tvl: '1200000',
    apr: '0.35',
    fee: '0.01',
    fee_rate: '0.000046',
    freezePeriod: '72',
  },
]

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

export const withdrawalsDummyData = [
  {
    amount: 49577,
    unfreeze_date: '9 Oct 2024',
    unfreeze_time: '03:45',
    status: 'unlocked',
  },
  {
    amount: 4232,
    unfreeze_date: '13 Sep 2024',
    unfreeze_time: '13:45',
    status: 'unlocked',
  },
  {
    amount: 125000,
    unfreeze_date: '19 Sep 2024',
    unfreeze_time: '17:15',
    status: 'unlocked',
  },
]
