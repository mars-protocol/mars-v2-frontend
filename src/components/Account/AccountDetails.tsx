import classNames from 'classnames'
import { useEffect, useState } from 'react'

import { Button, LabelValuePair, PositionsList } from 'components'
import { AccountManageOverlay, RiskChart } from 'components/Account'
import { ArrowRightLine, ChevronDown, ChevronLeft } from 'components/Icons'
import { useAccountStats, useBalances } from 'hooks/data'
import {
  useAccountDetailsStore,
  useNetworkConfigStore,
  useSettingsStore,
  useWalletStore,
} from 'stores'
import { lookup } from 'utils/formatters'
import { createRiskData } from 'utils/risk'

export const AccountDetails = () => {
  const enableAnimations = useSettingsStore((s) => s.enableAnimations)
  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)
  const isOpen = useAccountDetailsStore((s) => s.isOpen)
  const chainInfo = useWalletStore((s) => s.chainInfo)
  const whitelistedAssets = useNetworkConfigStore((s) => s.assets.whitelist)

  const balances = useBalances()
  const accountStats = useAccountStats()

  const [showManageMenu, setShowManageMenu] = useState(false)
  const [riskData, setRiskData] = useState<RiskTimePair[]>()

  const coinDenom = chainInfo?.currencies[0].coinMinimalDenom || 'uosmo'

  useEffect(() => {
    setRiskData(createRiskData(accountStats?.risk ?? 0))
  }, [accountStats?.risk, selectedAccount])

  return (
    <div
      className={classNames(
        'relative flex w-[400px] basis-[400px] flex-wrap content-start border-white/20 bg-header',
        enableAnimations && 'transition-[margin] duration-1000 ease-in-out',
        isOpen ? 'mr-0' : '-mr-[400px]',
      )}
    >
      <Button
        onClick={() => {
          useAccountDetailsStore.setState({ isOpen: true })
        }}
        variant='text'
        className={classNames(
          'absolute top-1/2 -left-[20px] w-[21px] -translate-y-1/2 bg-header p-0',
          'rounded-none rounded-tl-sm rounded-bl-sm',
          'border border-white/20',
          enableAnimations && 'transition-[opacity] delay-1000 duration-500 ease-in-out',
          isOpen ? 'pointer-events-none opacity-0' : 'opacity-100',
        )}
      >
        <span
          className={classNames(
            'flex h-20 px-1 py-6 text-white/40 hover:text-white',
            enableAnimations && 'transition-[color]',
          )}
        >
          <ChevronLeft />
        </span>
      </Button>
      <div className='relative flex w-full flex-wrap items-center border-b border-white/20'>
        <Button
          variant='text'
          className='flex flex-grow flex-nowrap items-center justify-center p-4 text-center text-white text-xl-caps'
          onClick={() => setShowManageMenu(!showManageMenu)}
        >
          Account {selectedAccount}
          <span className='ml-2 flex w-4'>
            <ChevronDown />
          </span>
        </Button>
        <div className='flex border-l border-white/20' onClick={() => {}}>
          <Button
            variant='text'
            className={classNames(
              'w-14 p-4 text-white/40 hover:cursor-pointer hover:text-white',
              enableAnimations && 'transition-[color]',
            )}
            onClick={() => {
              useAccountDetailsStore.setState({ isOpen: false })
            }}
          >
            <ArrowRightLine />
          </Button>
        </div>
        <AccountManageOverlay
          className='top-[60px] left-[36px]'
          show={showManageMenu}
          setShow={setShowManageMenu}
        />
      </div>
      <div className='flex w-full flex-wrap p-3'>
        <LabelValuePair
          className='mb-2'
          label='Total Position:'
          value={{
            format: 'number',
            amount: lookup(accountStats?.totalPosition ?? 0, coinDenom, whitelistedAssets),
            prefix: '$',
          }}
        />
        <LabelValuePair
          label='Total Liabilities:'
          value={{
            format: 'number',
            amount: lookup(accountStats?.totalDebt ?? 0, coinDenom, whitelistedAssets),
            prefix: '$',
          }}
        />
      </div>
      {riskData && <RiskChart data={riskData} />}
      <PositionsList title='Balances' data={balances} />
    </div>
  )
}
