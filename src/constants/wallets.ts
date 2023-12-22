import { ChainInfoID, WalletID } from 'types/enums/wallet'

export const WALLETS: WalletInfos = {
  [WalletID.Cosmostation]: {
    name: 'Cosmostation Wallet',
    install: 'Install Cosmostation Wallet',
    installURL:
      'https://chrome.google.com/webstore/detail/cosmostation-wallet/fpkhgmpbidmiogeglndfbkegfdlnajnf',
    imageURL: '/images/wallets/cosmostation.png',

    supportedChains: [ChainInfoID.Osmosis1, ChainInfoID.OsmosisDevnet, ChainInfoID.Pion1],
  },
  [WalletID.CosmostationMobile]: {
    name: 'Cosmostation Wallet',
    walletConnect: 'Cosmostation WalletConnect',
    imageURL: '/images/wallets/cosmostation.png',
    mobileImageURL: '/images/wallets/cosmostation-wc.png',
    supportedChains: [ChainInfoID.Osmosis1, ChainInfoID.OsmosisDevnet],
  },
  [WalletID.Keplr]: {
    name: 'Keplr Wallet',
    install: 'Install Keplr Wallet',
    installURL: 'https://www.keplr.app/download',
    imageURL: '/images/wallets/keplr.png',
    supportedChains: [ChainInfoID.Osmosis1, ChainInfoID.OsmosisDevnet, ChainInfoID.Pion1],
  },
  [WalletID.KeplrMobile]: {
    name: 'Keplr Wallet',
    walletConnect: 'Keplr WalletConnect',
    imageURL: '/images/wallets/keplr.png',
    mobileImageURL: '/images/wallets/keplr-wc.png',
    supportedChains: [ChainInfoID.Osmosis1],
  },
  [WalletID.Leap]: {
    name: 'Leap Wallet',
    install: 'Install Leap Wallet',
    installURL:
      'https://chrome.google.com/webstore/detail/leap-cosmos-wallet/fcfcfllfndlomdhbehjjcoimbgofdncg',
    imageURL: '/images/wallets/leap.png',
    supportedChains: [ChainInfoID.Osmosis1, ChainInfoID.OsmosisDevnet, ChainInfoID.Pion1],
  },
  [WalletID.LeapMobile]: {
    name: 'Leap Wallet',
    walletConnect: 'Leap WalletConnect',
    imageURL: '/images/wallets/leap.png',
    mobileImageURL: '/images/wallets/leap-wc.png',
    supportedChains: [ChainInfoID.Osmosis1, ChainInfoID.OsmosisDevnet],
  },
  [WalletID.LeapSnap]: {
    name: 'MetaMask (via Leap Snap)',
    install: 'Install MetaMask',
    installURL: 'https://metamask.io/download/',
    imageURL: '/images/wallets/leap-snap.png',
    supportedChains: [ChainInfoID.Osmosis1, ChainInfoID.OsmosisDevnet, ChainInfoID.Pion1],
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
    imageURL: '/images/wallets/xdefi.png',
    supportedChains: [ChainInfoID.Osmosis1],
  },
  [WalletID.Vectis]: {
    name: 'Vectis Wallet',
    install: 'Install Vectis Wallet',
    installURL: 'https://chrome.google.com/webstore/detail/vectis/cgkaddoglojnmfiblgmlinfaijcdpfjm',
    imageURL: '/images/wallets/vectis.png',
    supportedChains: [ChainInfoID.Pion1],
  },
}
