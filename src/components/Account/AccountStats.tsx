import { useMemo } from 'react'

import HealthBar from 'components/Account/HealthBar'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { ArrowChartLineUp, Heart } from 'components/Icons'
import Text from 'components/Text'
import { ORACLE_DENOM } from 'constants/oracle'
import useBorrowMarketAssetsTableData from 'hooks/useBorrowMarketAssetsTableData'
import useHealthComputer from 'hooks/useHealthComputer'
import useLendingMarketAssetsTableData from 'hooks/useLendingMarketAssetsTableData'
import usePrices from 'hooks/usePrices'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountApr, calculateAccountBalanceValue } from 'utils/accounts'

interface Props {
  account: Account
}

export default function AccountStats(props: Props) {
  const { data: prices } = usePrices()
  const positionBalance = useMemo(
    () => calculateAccountBalanceValue(props.account, prices),
    [props.account, prices],
  )
  const { health } = useHealthComputer(props.account)
  const { availableAssets: borrowAvailableAssets, accountBorrowedAssets } =
    useBorrowMarketAssetsTableData()
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()
  const borrowAssetsData = useMemo(
    () => [...borrowAvailableAssets, ...accountBorrowedAssets],
    [borrowAvailableAssets, accountBorrowedAssets],
  )
  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )
  const apr = useMemo(
    () => calculateAccountApr(props.account, borrowAssetsData, lendingAssetsData, prices),
    [props.account, borrowAssetsData, lendingAssetsData, prices],
  )
  return (
    <div className='flex flex-wrap w-full'>
      <DisplayCurrency
        coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, positionBalance)}
        className='w-full text-xl'
      />
      <div className='flex items-center justify-between w-full mt-1'>
        <div className='flex items-center'>
          <ArrowChartLineUp className='w-4 mr-1' />
          <FormattedNumber
            className='text-xs text-white/70'
            amount={apr.toNumber()}
            options={{ prefix: 'APR: ', suffix: '%', minDecimals: 2, maxDecimals: 2 }}
          />
        </div>
        <div className='flex items-center gap-1'>
          <Heart className='w-3' />
          <Text size='xs' className='w-auto mr-1 text-white/70'>
            Health
          </Text>
          <HealthBar health={health} className='w-[92px] h-0.5' hasLabel />
        </div>
      </div>
    </div>
  )
}
