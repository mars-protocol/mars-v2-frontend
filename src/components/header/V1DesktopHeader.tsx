import classNames from 'classnames'
import { useMemo } from 'react'
import { isDesktop } from 'react-device-detect'

import Wallet from 'components/Wallet'
import EscButton from 'components/common/Button/EscButton'
import Settings from 'components/common/Settings'
import ChainSelect from 'components/header/ChainSelect'
import OracleResyncButton from 'components/header/OracleResyncButton'
import RewardsCenter from 'components/header/RewardsCenter'
import DesktopNavigation from 'components/header/navigation/DesktopNavigation'
import useAccountId from 'hooks/useAccountId'
import useStore from 'store'
import { WalletID } from 'types/enums/wallet'
import { getGovernanceUrl } from 'utils/helpers'

const menuTree = (walletId: WalletID, chainConfig: ChainConfig): MenuTreeEntry[] => [
  {
    pages: ['v1'],
    label: 'Red Bank',
  },
  { pages: ['governance'], label: 'Governance', externalUrl: getGovernanceUrl(walletId) },
]

export default function DesktopHeader() {
  const address = useStore((s) => s.address)
  const focusComponent = useStore((s) => s.focusComponent)
  const isOracleStale = useStore((s) => s.isOracleStale)
  const accountId = useAccountId()

  function handleCloseFocusMode() {
    if (focusComponent && focusComponent.onClose) focusComponent.onClose()
    useStore.setState({ focusComponent: null })
  }

  const showStaleOracle = useMemo(() => isOracleStale && address, [isOracleStale, address])

  if (!isDesktop) return null

  return (
    <header
      className={classNames(
        'fixed left-0 top-0 z-50 w-full',
        'before:content-[" "] before:absolute before:inset-0 before:-z-1 before:h-full before:w-full before:rounded-sm before:backdrop-blur-sticky',
      )}
    >
      <div
        className={classNames(
          'flex items-center justify-between px-4 py-4',
          focusComponent ? 'relative isolate' : 'border-b border-white/20',
        )}
      >
        <DesktopNavigation menuTree={menuTree} />

        {focusComponent ? (
          <div className='flex justify-between w-full'>
            <div className='flex h-5 w-13' />
            {address && (
              <div className='flex gap-4'>
                <Wallet />
                <ChainSelect />
              </div>
            )}
            <div className='flex gap-4'>
              {!address && <ChainSelect />}
              <EscButton onClick={handleCloseFocusMode} />
            </div>
          </div>
        ) : (
          <div className='flex gap-4'>
            {showStaleOracle && <OracleResyncButton />}
            {accountId && <RewardsCenter />}
            <Wallet />
            <ChainSelect />
            <Settings />
          </div>
        )}
      </div>
    </header>
  )
}
