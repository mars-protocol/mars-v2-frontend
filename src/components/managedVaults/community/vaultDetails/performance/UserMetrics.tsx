import AssetImage from 'components/common/assets/AssetImage'
import classNames from 'classnames'
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
  vaultDetails: ExtendedManagedVaultDetails
}

export default function UserMetrics(props: Props) {
  const { vaultAddress, vaultDetails } = props
  const address = useStore((s) => s.address)
  const { amount: userVaultShares, calculateVaultShare } = useManagedVaultUserShares(
    address,
    vaultDetails.vault_tokens_denom,
    vaultAddress,
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
      value: userVaultTokensAmount ? (
        <div className='flex items-center justify-center gap-1'>
          <AssetImage asset={depositAsset} className='w-5 h-5' />
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(depositAsset.denom, BN(userVaultTokensAmount))}
            className='text-base'
          />
        </div>
      ) : (
        '0'
      ),
      label: 'My Current Balance',
    },
    {
      value: (
        <DisplayCurrency
          coin={BNCoin.fromDenomAndBigNumber(depositAsset.denom, BN(223231333))}
          className='text-base'
        />
      ),
      label: 'Total Earnings',
    },
    {
      value: (
        <FormattedNumber
          amount={Number(222)}
          options={{
            maxDecimals: 2,
            minDecimals: 2,
            suffix: '%',
          }}
          className={classNames('text-base', sharePercentage > 0 ? 'text-profit' : 'text-loss')}
        />
      ),
      label: 'ROI',
    },
    {
      value: (
        <FormattedNumber
          amount={Number(sharePercentage)}
          options={{
            maxDecimals: 2,
            minDecimals: 2,
            suffix: '%',
          }}
          className='text-base'
        />
      ),
      label: 'Vault Shares',
      suffix: '%',
    },
  ]

  return (
    <div className='grid grid-cols-2 sm:flex justify-center gap-4 w-full'>
      {metrics.map((metric, index) => (
        <div key={index} className='relative text-center py-4 sm:flex-1'>
          <TitleAndSubCell title={metric.value} sub={metric.label} />
          {index < metrics.length - 1 && (
            <div className='hidden sm:block absolute right-0 top-1/2 h-8 w-[1px] bg-white/10 -translate-y-1/2' />
          )}
        </div>
      ))}
    </div>
  )
}
