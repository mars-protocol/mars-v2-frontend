import { ChainInfoID, WalletID } from 'types/enums/wallet'

export const WALLETS: WalletInfos = {
  [WalletID.Cosmostation]: {
    name: 'Cosmostation Wallet',
    install: 'Install Cosmostation Wallet',
    installURL:
      'https://chrome.google.com/webstore/detail/cosmostation-wallet/fpkhgmpbidmiogeglndfbkegfdlnajnf',
    imageURL:
      'https://raw.githubusercontent.com/mars-protocol/wallet-connector/main/src/components/ui/images/cosmostation-wallet-extension.png',

    supportedChains: [ChainInfoID.Osmosis1, ChainInfoID.OsmosisDevnet, ChainInfoID.OsmosisTestnet],
  },
  [WalletID.CosmostationMobile]: {
    name: 'Cosmostation Wallet',
    walletConnect: 'Cosmostation WalletConnect',
    imageURL:
      'https://raw.githubusercontent.com/mars-protocol/wallet-connector/main/src/components/ui/images/cosmostation-wallet-extension.png',
    mobileImageURL:
      'https://raw.githubusercontent.com/mars-protocol/wallet-connector/main/src/components/ui/images/cosmostation-wallet-connect.png',
    supportedChains: [ChainInfoID.Osmosis1, ChainInfoID.OsmosisTestnet],
  },
  [WalletID.Keplr]: {
    name: 'Keplr Wallet',
    install: 'Install Keplr Wallet',
    installURL: 'https://www.keplr.app/download',
    imageURL: '/images/wallets/keplr.png',
    supportedChains: [ChainInfoID.Osmosis1, ChainInfoID.OsmosisDevnet, ChainInfoID.OsmosisTestnet],
  },
  [WalletID.KeplrMobile]: {
    name: 'Keplr Wallet',
    walletConnect: 'Keplr WalletConnect',
    imageURL: '/images/wallets/keplr.png',
    mobileImageURL:
      'https://raw.githubusercontent.com/mars-protocol/wallet-connector/main/src/components/ui/images/keplr-wallet-connect.png',
    supportedChains: [ChainInfoID.Osmosis1],
  },
  [WalletID.Leap]: {
    name: 'Leap Wallet',
    install: 'Install Leap Wallet',
    installURL:
      'https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg',
    imageURL: 'https://assets.leapwallet.io/logos/leap-cosmos-logo.png',
    supportedChains: [ChainInfoID.Osmosis1, ChainInfoID.OsmosisTestnet],
  },
  [WalletID.Station]: {
    name: 'Station Wallet',
    install: 'Install Station Wallet',
    installURL:
      'https://chrome.google.com/webstore/detail/station-wallet/aiifbnbfobpmeekipheeijimdpnlpgpp',
    imageURL: '/images/wallets/station.png',
    supportedChains: [ChainInfoID.Osmosis1],
  },
  [WalletID.Xdefi]: {
    name: 'XDEFI Wallet',
    install: 'Install XDEFI Wallet',
    installURL: 'https://go.xdefi.io/mars',
    imageURL: 'https://xdefi-static.s3.eu-west-1.amazonaws.com/xdefi.png',
    supportedChains: [ChainInfoID.Osmosis1],
  },
}
