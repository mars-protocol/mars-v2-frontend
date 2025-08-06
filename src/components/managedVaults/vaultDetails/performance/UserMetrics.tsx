import classNames from 'classnames'
import AssetImage from 'components/common/assets/AssetImage'
import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import { useManagedVaultConvertToBaseTokens } from 'hooks/managedVaults/useManagedVaultConvertToBaseTokens'
import useManagedVaultUserPosition from 'hooks/managedVaults/useManagedVaultUserPosition'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { BN } from 'utils/helpers'

interface Props {
  vaultAddress: string
  vaultDetails: ManagedVaultsData
  userAddress: string
}

export default function UserMetrics(props: Props) {
  const { vaultAddress, vaultDetails, userAddress } = props

  const {
    data: userPosition,
    calculateVaultShare,
    calculateROI,
  } = useManagedVaultUserPosition(vaultAddress, userAddress)
  const { data: userVaultTokensAmount } = useManagedVaultConvertToBaseTokens(
    vaultAddress,
    userPosition?.shares ?? '0',
  )

  const sharePercentage = calculateVaultShare(vaultDetails.vault_tokens_amount)
  const vaultAssets = useVaultAssets()
  const depositAsset = vaultAssets.find(byDenom(vaultDetails.base_tokens_denom)) as Asset

  const metrics = [
    {
      value: userVaultTokensAmount || 0,
      label: 'Your Current Balance',
      isCurrency: true,
      formatOptions: { maxDecimals: 2, minDecimals: 2 },
    },
    {
      value: userPosition?.pnl || 0,
      label: 'Your Total Earnings',
      isCurrency: true,
      formatOptions: { maxDecimals: 2, minDecimals: 2 },
      isProfitOrLoss: true,
      showSignPrefix: true,
    },
    {
      value: calculateROI(userVaultTokensAmount ?? 0),
      label: 'Your ROI',
      formatOptions: { maxDecimals: 2, minDecimals: 2, suffix: '%' },
      isProfitOrLoss: true,
    },
    {
      value: sharePercentage,
      label: 'Your Vault Shares',
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
              'text-profit': metric.isProfitOrLoss && BN(metric.value).isGreaterThan(0),
              'text-loss': metric.isProfitOrLoss && BN(metric.value).isLessThan(0),
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
