'use client'

import { useWalletManager, WalletConnectionStatus } from '@marsprotocol/wallet-connector'
import classNames from 'classnames'

const filter = {
  day: 'brightness-100 hue-rotate-0',
  night: '-hue-rotate-82 brightness-30',
}

export default function Background() {
  const { status } = useWalletManager()

  const backgroundClasses = classNames(
    status === WalletConnectionStatus.Connected ? filter.day : filter.night,
    'top-0 left-0 absolute block h-full w-full flex-col bg-body bg-mars bg-desktop bg-top bg-no-repeat filter',
    true && 'transition-background duration-3000 ease-linear',
  )

  return <div className={backgroundClasses} />
}
