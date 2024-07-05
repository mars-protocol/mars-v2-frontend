import BigNumber from 'bignumber.js'
import classNames from 'classnames'
import { useMemo } from 'react'

import useBorrowMarketAssetsTableData from 'components/borrow/Table/useBorrowMarketAssetsTableData'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import useLendingMarketAssetsTableData from 'components/earn/lend/Table/useLendingMarketAssetsTableData'
import { BN_ZERO, MAX_AMOUNT_DECIMALS } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useFarmAprs from 'hooks/farms/useFarmAprs'
import useHLSStakingAssets from 'hooks/hls/useHLSStakingAssets'
import useVaultAprs from 'hooks/vaults/useVaultAprs'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { calculateAccountApr, getAccountPositionValues } from 'utils/accounts'

interface Props {
  account: Account
  isHls?: boolean
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
  const updatedAccount = useStore((s) => s.updatedAccount)
  const { account } = props
  const hasChanged = !!updatedAccount
  const { data: hlsStrategies } = useHLSStakingAssets()
  const { data: vaultAprs } = useVaultAprs()
  const farmAprs = useFarmAprs()
  const assets = useWhitelistedAssets()
  const data = useBorrowMarketAssetsTableData()
  const borrowAssetsData = useMemo(() => data?.allAssets || [], [data])
  const { availableAssets: lendingAvailableAssets, accountLentAssets } =
    useLendingMarketAssetsTableData()
  const lendingAssetsData = useMemo(
    () => [...lendingAvailableAssets, ...accountLentAssets],
    [lendingAvailableAssets, accountLentAssets],
  )

  const [
    depositsBalance,
    lendsBalance,
    debtsBalance,
    vaultsBalance,
    perps,
    perpsVault,
    stakedAstroLps,
  ] = useMemo(() => getAccountPositionValues(account, assets), [account, assets])
  const totalBalance = useMemo(
    () =>
      depositsBalance
        .plus(lendsBalance)
        .plus(vaultsBalance)
        .plus(perps)
        .plus(perpsVault)
        .plus(stakedAstroLps),
    [depositsBalance, lendsBalance, perps, perpsVault, vaultsBalance, stakedAstroLps],
  )

  const [updatedPositionValue, updatedDebtsBalance] = useMemo(() => {
    const [
      updatedDepositsBalance,
      updatedLendsBalance,
      updatedDebtsBalance,
      updatedVaultsBalance,
      updatedPerpsBalance,
      updatedPerpsVaultBalance,
      updatedStakedAstroLps,
    ] = updatedAccount
      ? getAccountPositionValues(updatedAccount, assets)
      : [BN_ZERO, BN_ZERO, BN_ZERO, BN_ZERO, BN_ZERO, BN_ZERO, BN_ZERO]

    const updatedPositionValue = updatedDepositsBalance
      .plus(updatedLendsBalance)
      .plus(updatedVaultsBalance)
      .plus(updatedPerpsBalance)
      .plus(updatedPerpsVaultBalance)
      .plus(updatedStakedAstroLps)

    return [updatedPositionValue, updatedDebtsBalance]
  }, [updatedAccount, assets])

  const apr = useMemo(
    () =>
      calculateAccountApr(
        account,
        borrowAssetsData,
        lendingAssetsData,
        hlsStrategies,
        assets,
        vaultAprs,
        farmAprs,
        props.isHls,
      ),
    [
      account,
      assets,
      borrowAssetsData,
      hlsStrategies,
      lendingAssetsData,
      props.isHls,
      vaultAprs,
      farmAprs,
    ],
  )
  const updatedApr = useMemo(
    () =>
      updatedAccount
        ? calculateAccountApr(
            updatedAccount,
            borrowAssetsData,
            lendingAssetsData,
            hlsStrategies,
            assets,
            vaultAprs,
            farmAprs,
            props.isHls,
          )
        : BN_ZERO,
    [
      updatedAccount,
      borrowAssetsData,
      lendingAssetsData,
      hlsStrategies,
      assets,
      vaultAprs,
      farmAprs,
      props.isHls,
    ],
  )

  return (
    <div className='flex-wrap w-full p-4 pb-1'>
      <Item
        title='Total Balance'
        current={totalBalance}
        change={hasChanged ? updatedPositionValue : totalBalance}
        className='pb-3'
      />
      <Item
        title='Total Debt'
        current={debtsBalance}
        change={hasChanged ? updatedDebtsBalance : debtsBalance}
        className='pb-3'
        isDecrease
      />
      <Item
        title='APR'
        current={apr}
        change={hasChanged ? updatedApr : apr}
        className='pb-3'
        isPercentage
      />
    </div>
  )
}

function Item(props: ItemProps) {
  const { current, change } = props
  const increase = props.isDecrease ? current.isGreaterThan(change) : current.isLessThan(change)

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
            animate
          />
        ) : (
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, current)}
            className='text-sm'
            options={{ abbreviated: false }}
          />
        )}
        {current.toFixed(2) !== change.toFixed(2) && (
          <>
            <span className={classNames('w-3', increase ? 'text-profit' : 'text-loss')}>
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
                className={classNames('text-sm', increase ? 'text-profit' : 'text-loss')}
                animate
              />
            ) : (
              <DisplayCurrency
                coin={BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, change)}
                className={classNames('text-sm', increase ? 'text-profit' : 'text-loss')}
                options={{ abbreviated: false }}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
