import classNames from 'classnames'
import { useMemo } from 'react'

import useAccountPerpData from 'components/account/AccountPerpPositionTable/useAccountPerpData'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import { MAX_AMOUNT_DECIMALS } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useAssets from 'hooks/assets/useAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { getAccountUnrealizedPnlValue } from 'utils/accounts'
import { useAccountSummaryStats } from 'hooks/accounts/useAccountSummaryStats'

interface Props {
  account: Account
}

interface ItemProps {
  title: string
  current: BigNumber
  change: BigNumber
  className?: string
  isDecrease?: boolean
  isPercentage?: boolean
}

export default function AccountComposition(props: Props) {
  const { account } = props
  const chainConfig = useChainConfig()
  const updatedAccount = useStore((s) => s.updatedAccount)
  const hasChanged = !!updatedAccount
  const accountPerpData = useAccountPerpData({
    account,
    updatedAccount,
  })
  const { data: assets } = useAssets()

  const { positionValue, debts, netWorth, collateralValue, apy, leverage } =
    useAccountSummaryStats(account)
  const {
    positionValue: updatedPositionValue,
    debts: updatedDebts,
    netWorth: updatedNetWorth,
    collateralValue: updatedCollateralValue,
    apy: updatedApy,
    leverage: updatedLeverage,
  } = useAccountSummaryStats(updatedAccount)

  const totalUnrealizedPnl = useMemo(
    () => getAccountUnrealizedPnlValue(account, assets),
    [account, assets],
  )

  const updatedUnrealizedPnl = useMemo(
    () => getAccountUnrealizedPnlValue(updatedAccount ?? account, assets),
    [updatedAccount, account, assets],
  )

  return (
    <div className='flex-wrap w-full p-4 pb-1'>
      <Item
        title='Total Balance'
        current={positionValue.amount}
        change={hasChanged ? updatedPositionValue.amount : positionValue.amount}
        className='pb-3'
      />
      <Item
        title='Collateral Power'
        current={collateralValue.amount}
        change={hasChanged ? updatedCollateralValue.amount : collateralValue.amount}
        className='pb-3'
      />
      <Item
        title='Total Debt'
        current={debts.amount}
        change={hasChanged ? updatedDebts.amount : debts.amount}
        className='pb-3'
        isDecrease
      />
      {chainConfig.perps && accountPerpData.length !== 0 && (
        <Item
          title='Unrealized PnL'
          current={totalUnrealizedPnl}
          change={hasChanged ? updatedUnrealizedPnl : totalUnrealizedPnl}
          className='pb-3'
        />
      )}
      <Item
        title='APY'
        current={apy}
        change={hasChanged ? updatedApy : apy}
        className='pb-3'
        isPercentage
      />
    </div>
  )
}

function Item(props: ItemProps) {
  const { current, change, title } = props
  const decrease = props.isDecrease ? change.isGreaterThan(current) : change.isLessThan(current)

  return (
    <div className={classNames('flex w-full flex-nowrap', props.className)}>
      <div className='flex items-center flex-shrink'>
        <Text size='sm' className='text-white/60'>
          {props.title}
        </Text>
      </div>
      <div className='flex items-center justify-end flex-1 gap-2'>
        {props.isPercentage ? (
          <FormattedNumber
            amount={current.toNumber()}
            options={{
              suffix: '%',
              minDecimals: 2,
              maxDecimals: current.abs().isLessThan(0.1) ? MAX_AMOUNT_DECIMALS : 2,
              abbreviated: false,
            }}
            className='text-sm'
          />
        ) : (
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, current)}
            className='text-sm'
            options={{ abbreviated: false }}
            {...(title === 'Unrealized PnL' && {
              showSignPrefix: true,
            })}
          />
        )}
        {current.toFixed(2) !== change.toFixed(2) && (
          <>
            <span className={classNames('w-3', decrease ? 'text-loss' : 'text-profit')}>
              <ArrowRight />
            </span>
            {props.isPercentage ? (
              <FormattedNumber
                amount={change.toNumber()}
                options={{
                  suffix: '%',
                  minDecimals: 2,
                  maxDecimals: change.abs().isLessThan(0.1) ? MAX_AMOUNT_DECIMALS : 2,
                }}
                className={classNames('text-sm', decrease ? 'text-loss' : 'text-profit')}
              />
            ) : (
              <DisplayCurrency
                coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, change)}
                className={classNames('text-sm', decrease ? 'text-loss' : 'text-profit')}
                options={{ abbreviated: false }}
                {...(title === 'Unrealized PnL' && {
                  showSignPrefix: true,
                })}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
