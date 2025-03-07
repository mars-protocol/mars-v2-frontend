import classNames from 'classnames'
import { useCallback, useMemo } from 'react'

import AccountSummaryLeverage from 'components/account/AccountSummary/AccountSummaryLeverage'
import HealthBar from 'components/account/Health/HealthBar'
import Button from 'components/common/Button'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { ArrowRight, ArrowRightLine } from 'components/common/Icons'
import Text from 'components/common/Text'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountBalanceValue } from 'utils/accounts'
import { BN } from 'utils/helpers'
import useChainConfig from 'hooks/chain/useChainConfig'
import useAsset from 'hooks/assets/useAsset'

interface Props {
  account: Account
  updatedAccount?: Account
  assets: Asset[]
  leverage: number
  updatedLeverage: number | null
  apr: number
  health: number
  updatedHealth: number
  healthFactor: number
  updatedHealthFactor: number
  isInModal?: boolean
}

export default function AccountSummaryHeader(props: Props) {
  const {
    account,
    updatedAccount,
    assets,
    leverage,
    updatedLeverage,
    health,
    healthFactor,
    updatedHealth,
    updatedHealthFactor,
    isInModal,
  } = props
  const onClose = useCallback(() => useStore.setState({ accountDetailsExpanded: false }), [])
  const accountBalance = useMemo(
    () => (account ? calculateAccountBalanceValue(account, assets) : BN_ZERO),
    [account, assets],
  )
  const updatedAccountBalance = useMemo(
    () => (updatedAccount ? calculateAccountBalanceValue(updatedAccount, assets) : undefined),
    [updatedAccount, assets],
  )
  const hasChanged = !BN(updatedAccountBalance?.toFixed(2) ?? 0)?.isEqualTo(
    accountBalance.toFixed(2),
  )
  const increase = updatedAccountBalance?.isGreaterThan(accountBalance)
  const isUSDCAccount = account.kind === 'usdc'
  const chainConfig = useChainConfig()
  const stableDenom = chainConfig.stables[0]
  const stableAsset = useAsset(stableDenom)

  return (
    <div className='relative flex flex-wrap w-full p-4 pb-2 border-b bg-white/10 border-white/10'>
      {!isInModal && (
        <Button
          onClick={onClose}
          leftIcon={<ArrowRightLine />}
          iconClassName='w-full'
          className='!absolute top-4 right-4 w-8 h-6 px-2 z-4 hidden md:flex'
          size='xs'
          color='secondary'
        />
      )}
      {!isInModal && (
        <Text
          size='sm'
          className='w-full pb-1 text-white/50'
        >{`Credit Account ${account.id}`}</Text>
      )}
      <div className='flex items-end w-full gap-2 pb-2 border-b border-white/5'>
        <DisplayCurrency
          options={{
            abbreviated: false,
            suffix: isUSDCAccount ? ` ${stableAsset?.symbol || 'USDC'}` : undefined,
          }}
          coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, accountBalance)}
          className='text-lg -mb-[1px]'
        />
        {hasChanged && updatedAccountBalance && (
          <>
            <span
              className={classNames(
                'w-3 flex h-full items-center',
                increase ? 'text-profit' : 'text-loss',
              )}
            >
              <ArrowRight />
            </span>
            <DisplayCurrency
              options={{
                abbreviated: false,
                suffix: isUSDCAccount ? ` ${stableAsset?.symbol || 'USDC'}` : undefined,
              }}
              coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, updatedAccountBalance)}
              className={classNames(
                'text-lg -mb-[1px]',
                hasChanged && increase && 'text-profit',
                hasChanged && !increase && 'text-loss',
              )}
            />
          </>
        )}

        <Text className='text-white/50' size='xs'>
          Net worth
        </Text>
      </div>
      <div className='flex items-center w-full pt-2'>
        <div className='flex flex-wrap pr-4 border-r w-29 border-white/5'>
          <Text size='xs' className='mb-0.5 w-full text-white/50'>
            Leverage
          </Text>
          <AccountSummaryLeverage
            leverage={leverage}
            updatedLeverage={updatedLeverage}
            className='text-sm'
            containerClassName='flex items-center gap-1'
            enforceSuffix
          />
        </div>
        <div className='flex flex-wrap content-start flex-grow h-full pl-2'>
          <Text size='xs' className='w-full h-4 mb-2 text-white/50'>
            Health
          </Text>
          <HealthBar
            health={health}
            healthFactor={healthFactor}
            updatedHealth={updatedHealth}
            updatedHealthFactor={updatedHealthFactor}
          />
        </div>
      </div>
    </div>
  )
}
