import BigNumber from 'bignumber.js'
import { useEffect } from 'react'

import { Button, FormattedNumber, Gauge, Text } from 'components'
import { BorrowCapacity } from 'components/BorrowCapacity'
import { useAccountStats } from 'hooks/data'
import { useCreateCreditAccount } from 'hooks/mutations'
import { useCreditAccounts } from 'hooks/queries'
import { useModalStore, useNetworkConfigStore } from 'stores'
import { formatValue } from 'utils/formatters'

export const AccountStatus = () => {
  const baseAsset = useNetworkConfigStore((s) => s.assets.base)
  const accountStats = useAccountStats()
  const { data: creditAccountsList } = useCreditAccounts()
  const { mutate: createCreditAccount, isLoading: isLoadingCreate } = useCreateCreditAccount()
  useEffect(() => {
    useModalStore.setState({ createAccountModal: isLoadingCreate })
  }, [isLoadingCreate])

  const hasCreditAccounts = creditAccountsList && creditAccountsList.length > 0

  if (!hasCreditAccounts) {
    return (
      <Button className='my-3 mr-6' onClick={() => createCreditAccount()}>
        Create Credit Account
      </Button>
    )
  }

  return (
    <div className='flex w-[400px] items-center justify-between gap-3 border-l border-l-white/20 px-3 py-3'>
      {accountStats && (
        <>
          <Text size='sm' className='flex flex-grow text-white'>
            <FormattedNumber
              amount={BigNumber(accountStats.netWorth)
                .dividedBy(10 ** baseAsset.decimals)
                .toNumber()}
              animate
              prefix='$: '
            />
          </Text>

          <Gauge
            value={accountStats.currentLeverage / accountStats.maxLeverage}
            label='Lvg'
            tooltip={
              <Text size='sm'>
                Current Leverage:{' '}
                {formatValue(accountStats.currentLeverage, 0, 2, true, false, 'x')}
                <br />
                Max Leverage: {formatValue(accountStats.maxLeverage, 0, 2, true, false, 'x')}
              </Text>
            }
          />

          <Gauge
            value={accountStats.risk}
            label='Risk'
            tooltip={
              <Text size='sm'>
                Current Risk: {formatValue(accountStats.risk * 100, 0, 2, true, false, '%')}
              </Text>
            }
          />
          <BorrowCapacity
            limit={80}
            max={100}
            balance={100 - accountStats.health * 100}
            barHeight='16px'
            hideValues={true}
            showTitle={false}
            className='w-[140px]'
          />
        </>
      )}
    </div>
  )
}
