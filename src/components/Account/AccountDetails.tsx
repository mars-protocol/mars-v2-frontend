'use client'

import classNames from 'classnames'
import { useEffect, useState } from 'react'

import { RiskChart } from 'components/Account/RiskChart'
import { Button } from 'components/Button'
import { ArrowRightLine, ChevronDown, ChevronLeft } from 'components/Icons'
import { LabelValuePair } from 'components/LabelValuePair'
import { useAccountStats } from 'hooks/data/useAccountStats'
import useStore from 'store'
import { getBaseAsset, getMarketAssets } from 'utils/assets'
import { convertFromGwei } from 'utils/formatters'
import { createRiskData } from 'utils/risk'

export const AccountDetails = () => {
  const enableAnimations = useStore((s) => s.enableAnimations)
  const selectedAccount = useStore((s) => s.selectedAccount)
  const isOpen = useStore((s) => s.isOpen)
  const marketAssets = getMarketAssets()
  const baseAsset = getBaseAsset()

  const accountStats = useAccountStats()

  const [showManageMenu, setShowManageMenu] = useState(false)
  const [riskData, setRiskData] = useState<RiskTimePair[]>()

  useEffect(() => {
    setRiskData(createRiskData(accountStats?.risk ?? 0))
  }, [accountStats?.risk, selectedAccount])

  return (
    <div
      className={classNames(
        'relative flex w-[400px] basis-[400px] flex-wrap content-start border-l border-white/20 bg-header',
        enableAnimations && 'transition-[margin] duration-1000 ease-in-out',
        isOpen ? 'mr-0' : '-mr-[400px]',
      )}
    >
      <Button
        onClick={() => {
          useStore.setState({ isOpen: true })
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
              useStore.setState({ isOpen: false })
            }}
          >
            <ArrowRightLine />
          </Button>
        </div>
      </div>
      <div className='flex w-full flex-wrap p-3'>
        <LabelValuePair
          className='mb-2'
          label='Total Position:'
          value={{
            format: 'number',
            amount: convertFromGwei(
              accountStats?.totalPosition ?? 0,
              baseAsset.denom,
              marketAssets,
            ),
            prefix: '$',
          }}
        />
        <LabelValuePair
          label='Total Liabilities:'
          value={{
            format: 'number',
            amount: convertFromGwei(accountStats?.totalDebt ?? 0, baseAsset.denom, marketAssets),
            prefix: '$',
          }}
        />
      </div>
      {riskData && <RiskChart data={riskData} />}
    </div>
  )
}
