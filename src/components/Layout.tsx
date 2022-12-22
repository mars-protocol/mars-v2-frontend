import { useWallet, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import classNames from 'classnames'
import React, { useEffect } from 'react'

import { AccountDetails } from 'components/Account'
import { DesktopNavigation } from 'components/Navigation'
import { useCreditAccounts } from 'hooks/queries'
import { useSettingsStore, useWalletStore } from 'stores'

const filter = {
  day: 'brightness-100 hue-rotate-0',
  night: '-hue-rotate-82 brightness-30',
}

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const enableAnimations = useSettingsStore((s) => s.enableAnimations)

  const { data: creditAccountsList } = useCreditAccounts()
  const hasCreditAccounts = creditAccountsList && creditAccountsList.length > 0

  const { status, signingCosmWasmClient, chainInfo, address, name } = useWallet()
  const initialize = useWalletStore((s) => s.actions.initialize)

  useEffect(() => {
    initialize(status, signingCosmWasmClient, address, name, chainInfo)
  }, [status, signingCosmWasmClient, chainInfo, address, name, initialize])

  const isConnected = status === WalletConnectionStatus.Connected

  const backgroundClasses = classNames(
    isConnected ? filter.day : filter.night,
    'top-0 left-0 absolute block h-full w-full flex-col bg-body bg-mars bg-desktop bg-top bg-no-repeat filter',
    enableAnimations && 'transition-background duration-3000 ease-linear',
  )

  return (
    <div className='relative min-h-screen w-full'>
      <div className={backgroundClasses} />
      <DesktopNavigation />
      <main className='relative flex lg:min-h-[calc(100vh-120px)]'>
        <div className='flex flex-grow flex-wrap p-6'>{children}</div>
        {hasCreditAccounts && <AccountDetails />}
      </main>
    </div>
  )
}
