import classNames from 'classnames'
import React from 'react'

import AccountManager from 'components/Account/AccountDetails'
import DesktopNavigation from 'components/Navigation/DesktopNavigation'
import useCreditAccounts from 'hooks/useCreditAccounts'
import useWalletStore from 'stores/useWalletStore'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const address = useWalletStore((s) => s.address)
  const { data: creditAccountsList, isLoading: isLoadingCreditAccounts } = useCreditAccounts()
  const hasCreditAccounts = creditAccountsList && creditAccountsList.length > 0

  const filter = {
    day: 'brightness-100 hue-rotate-0',
    night: '-hue-rotate-82 brightness-30',
  }

  const isConnected = !!address

  const backgroundClasses = classNames(
    isConnected ? filter.day : filter.night,
    'top-0 left-0 absolute block h-full w-full flex-col bg-body bg-mars bg-desktop bg-top bg-no-repeat filter transition-background duration-3000 ease-linear',
  )

  return (
    <div className='relative min-h-screen w-full'>
      <div className={backgroundClasses} />
      <DesktopNavigation />
      <main className='relative flex lg:h-[calc(100vh-120px)]'>
        <div className='flex flex-grow flex-wrap p-6'>{children}</div>
        {hasCreditAccounts && <AccountManager />}
      </main>
    </div>
  )
}

export default Layout
