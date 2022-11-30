import BigNumber from 'bignumber.js'

import { BorrowCapacity } from 'components/BorrowCapacity'
import Button from 'components/Button'
import SemiCircleProgress from 'components/SemiCircleProgress'
import Text from 'components/Text'
import Tooltip from 'components/Tooltip'
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

  return (
    <div className='flex w-[400px] items-center justify-between gap-3 border-l border-l-white/20 px-3 py-3'>
      {accountStats && (
        <>
          <Text size='sm' className='flex flex-grow text-white'>
            {formatValue(
              BigNumber(accountStats.netWorth)
                .dividedBy(10 ** chain.stakeCurrency.coinDecimals)
                .toNumber(),
              2,
              2,
              true,
              '$: ',
              false,
              false,
            )}
          </Text>
          <Tooltip
            content={
              <Text size='sm'>
                {formatValue(accountStats.currentLeverage, 0, 2, false, false, 'x')}
              </Text>
            }
          >
            <SemiCircleProgress
              value={accountStats.currentLeverage / accountStats.maxLeverage}
              label='Lvg'
            />
          </Tooltip>
          <SemiCircleProgress value={accountStats.risk} label='Risk' />
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
