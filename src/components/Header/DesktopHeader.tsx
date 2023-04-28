import AccountMenu from 'components/Account/AccountMenu'
import DesktopNavigation from 'components/Navigation/DesktopNavigation'
import Settings from 'components/Settings'
import Wallet from 'components/Wallet/Wallet'
import { WalletConnectProvider } from 'components/Wallet/WalletConnectProvider'

import styles from './DesktopHeader.module.css'

export const menuTree: { href: RouteSegment; label: string }[] = [
  { href: 'trade', label: 'Trade' },
  { href: 'earn/farm', label: 'Earn' },
  { href: 'borrow', label: 'Borrow' },
  { href: 'portfolio', label: 'Portfolio' },
  { href: 'council', label: 'Council' },
]

interface Props {
  params: PageParams
}

export default function DesktopHeader(props: Props) {
  return (
    <header className={styles.container}>
      <div className={styles.wrapper}>
        <DesktopNavigation />
        <div className={styles.accountPanel}>
          <AccountMenu params={props.params} />
          <WalletConnectProvider>
            <Wallet />
          </WalletConnectProvider>
          <Settings />
        </div>
      </div>
    </header>
  )
}
