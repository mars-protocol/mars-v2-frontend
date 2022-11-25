import React from 'react'
import classNames from 'classnames'

import CreditManager from 'components/CreditManager'
import Navigation from 'components/Navigation'
import useCreditManagerStore from 'stores/useCreditManagerStore'
import useWalletStore from 'stores/useWalletStore'

const Layout = ({ children }: { children: React.ReactNode }) => {
  const isOpen = useCreditManagerStore((s) => s.isOpen)
  const address = useWalletStore((s) => s.address)

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
    <main className='relative min-h-screen w-full'>
      <div className={backgroundClasses} />
      <Navigation />
      <div className='relative flex-1 p-6'>
        {children}
        {isOpen && <CreditManager />}
      </div>
    </main>
  )
}

export default Layout
