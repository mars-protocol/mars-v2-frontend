import AssetImage from 'components/common/assets/AssetImage'
import DisplayCurrency from 'components/common/DisplayCurrency'
import useStore from 'store'
import useVaultAssets from 'hooks/assets/useVaultAssets'
import TitleAndSubCell from 'components/common/TitleAndSubCell'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { useManagedVaultConvertToTokens } from 'hooks/managedVaults/useManagedVaultConvertToTokens'
import { useManagedVaultUserShares } from 'hooks/managedVaults/useManagedVaultUserShares'

interface Props {
  vaultAddress: string
  vaultDetails: ManagedVaultsData
}

export default function UserMetrics(props: Props) {
  const { vaultAddress, vaultDetails } = props
  const address = useStore((s) => s.address)
  const { amount: userVaultShares, calculateVaultShare } = useManagedVaultUserShares(
    address,
    vaultDetails.vault_tokens_denom,
  )
  const { data: userVaultTokensAmount } = useManagedVaultConvertToTokens(
    vaultAddress,
    userVaultShares,
  )
  const sharePercentage = calculateVaultShare(vaultDetails.vault_tokens_amount)
  const vaultAssets = useVaultAssets()
  const depositAsset = vaultAssets.find(byDenom(vaultDetails.base_tokens_denom)) as Asset

  const metrics = [
    {
      value: userVaultTokensAmount || 0,
      label: 'My Current Balance',
      isCurrency: true,
      formatOptions: { maxDecimals: 2, minDecimals: 2 },
    },
    {
      value: 0,
      label: 'Total Earnings',
      isCurrency: true,
      formatOptions: { maxDecimals: 2, minDecimals: 2 },
    },
    {
      value: 0,
      label: 'ROI',
      formatOptions: { maxDecimals: 2, minDecimals: 2, suffix: '%' },
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
            />
          </div>
        ) : (
          <FormattedNumber
            amount={Number(metric.value)}
            options={metric.formatOptions}
            className='text-base'
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
