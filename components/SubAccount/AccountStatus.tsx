import BigNumber from 'bignumber.js'

import { BorrowCapacity } from 'components/BorrowCapacity'
import Button from 'components/Button'
import FormattedNumber from 'components/FormattedNumber'
import Gauge from 'components/Gauge'
import Text from 'components/Text'
import useAccountStats from 'hooks/useAccountStats'
import useCreditAccounts from 'hooks/useCreditAccounts'
import { chain } from 'utils/chains'
import { formatValue } from 'utils/formatters'

interface Props {
  createCreditAccount: () => void
}

const AccountStatus = ({ createCreditAccount }: Props) => {
  const accountStats = useAccountStats()
  const { data: creditAccountsList, isLoading: isLoadingCreditAccounts } = useCreditAccounts()
  const hasCreditAccounts = creditAccountsList && creditAccountsList.length > 0

  if (!hasCreditAccounts) {
    return (
      <Button className='my-3 mr-6' onClick={() => createCreditAccount()}>
        Create Credit Account
      </Button>
    )
  }

  console.log(accountStats)

  return (
    <div className='flex w-[400px] items-center justify-between gap-3 border-l border-l-white/20 px-3 py-3'>
      {accountStats && (
        <>
          <Text size='sm' className='flex flex-grow text-white'>
            <FormattedNumber
              amount={BigNumber(accountStats.netWorth)
                .dividedBy(10 ** chain.stakeCurrency.coinDecimals)
                .toNumber()}
              animate={true}
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
            decimals={1}
            hideValues={true}
            showTitle={false}
            className='w-[140px]'
            percentageDelta={40}
          />
        </>
      )}
    </div>
  )
}
export default AccountStatus
