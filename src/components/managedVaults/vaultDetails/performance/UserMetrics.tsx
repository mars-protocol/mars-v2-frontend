import AssetImage from 'components/common/assets/AssetImage'
import DisplayCurrency from 'components/common/DisplayCurrency'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { useManagedVaultConvertToBaseTokens } from 'hooks/managedVaults/useManagedVaultConvertToBaseTokens'
import useManagedVaultUserPosition from 'hooks/managedVaults/useManagedVaultUserPosition'
import classNames from 'classnames'

interface Props {
  vaultAddress: string
  vaultDetails: ManagedVaultsData
  userAddress: string
}

export default function UserMetrics(props: Props) {
  const { vaultAddress, vaultDetails, userAddress } = props

  const { data: userPosition, calculateVaultShare } = useManagedVaultUserPosition(
    vaultAddress,
    userAddress,
  )
  const { data: userVaultTokensAmount } = useManagedVaultConvertToBaseTokens(
    vaultAddress,
    userPosition?.shares ?? '0',
  )

  const sharePercentage = calculateVaultShare(vaultDetails.vault_tokens_amount)
  const vaultAssets = useVaultAssets()
  const depositAsset = vaultAssets.find(byDenom(vaultDetails.base_tokens_denom)) as Asset

  const calculateROI = (currentBalance: string | number | undefined): number => {
    if (!userPosition?.pnl || !currentBalance || BN(currentBalance).isZero()) {
      return 0
    }
    return BN(userPosition.pnl).multipliedBy(100).dividedBy(currentBalance).toNumber()
  }

  const metrics = [
    {
      value: userVaultTokensAmount || 0,
      label: 'My Current Balance',
      isCurrency: true,
      formatOptions: { maxDecimals: 2, minDecimals: 2 },
    },
    {
      value: userPosition?.pnl || 0,
      label: 'Total Earnings',
      isCurrency: true,
      formatOptions: { maxDecimals: 2, minDecimals: 2 },
      isProfitOrLoss: true,
      showSignPrefix: true,
    },
    {
      value: calculateROI(userVaultTokensAmount),
      label: 'ROI',
      formatOptions: { maxDecimals: 2, minDecimals: 2, suffix: '%' },
      isProfitOrLoss: true,
    },
    {
      value: sharePercentage,
      label: 'Vault Shares',
      formatOptions: { maxDecimals: 2, minDecimals: 2, suffix: '%' },
    },
  ]

  return (
    <div className='grid grid-cols-2 sm:flex justify-center gap-4 w-full'>
      {metrics.map((metric, index) => {
        const value = metric.isCurrency ? (
          <div className='flex items-center justify-center gap-1'>
            <AssetImage asset={depositAsset} className='w-5 h-5' />
            <DisplayCurrency
              coin={BNCoin.fromDenomAndBigNumber(depositAsset.denom, BN(metric.value))}
              options={metric.formatOptions}
              className='text-base'
              isProfitOrLoss={metric.isProfitOrLoss}
              showSignPrefix={metric.showSignPrefix}
            />
          </div>
        ) : (
          <FormattedNumber
            amount={Number(metric.value)}
            options={metric.formatOptions}
            className={classNames('text-base', {
              'text-profit': metric.isProfitOrLoss && BN(metric.value).isPositive(),
              'text-loss': metric.isProfitOrLoss && BN(metric.value).isNegative(),
            })}
          />
        )

        return (
          <div key={index} className='relative text-center py-4 sm:flex-1'>
            <TitleAndSubCell title={value} sub={metric.label} />
            {index < metrics.length - 1 && (
              <div className='hidden sm:block absolute right-0 top-1/2 h-8 w-[1px] bg-white/10 -translate-y-1/2' />
            )}
          </div>
        )
      })}
    </div>
  )
}
