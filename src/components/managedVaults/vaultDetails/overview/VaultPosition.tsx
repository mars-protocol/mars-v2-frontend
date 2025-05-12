import AssetImage from 'components/common/assets/AssetImage'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Loading from 'components/common/Loading'
import PositionInfo from 'components/managedVaults/vaultDetails/common/PositionInfo'
import Text from 'components/common/Text'
import useStore from 'store'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { LockUnlocked } from 'components/common/Icons'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { useManagedVaultConvertToBaseTokens } from 'hooks/managedVaults/useManagedVaultConvertToBaseTokens'
import useManagedVaultUserPosition from 'hooks/managedVaults/useManagedVaultUserPosition'

interface Props {
  details: ManagedVaultsData
  vaultAddress: string
  isOwner: boolean
  onDeposit: () => void
  onWithdraw: () => void
  depositAsset: Asset
}

export default function VaultPosition(props: Props) {
  const { details, isOwner, vaultAddress, onDeposit, onWithdraw, depositAsset } = props

  const address = useStore((s) => s.address)
  const { data: userPosition, calculateVaultShare } = useManagedVaultUserPosition(
    vaultAddress,
    address,
  )
  const { data: userVaultTokensAmount, isLoading } = useManagedVaultConvertToBaseTokens(
    vaultAddress,
    userPosition?.shares ?? '0',
  )
  const sharePercentage = calculateVaultShare(details.vault_tokens_amount)

  return (
    <PositionInfo
      value={
        isLoading ? (
          <Loading className='w-12 h-6' />
        ) : !userVaultTokensAmount ? (
          <Text>No deposits</Text>
        ) : (
          <div className='flex items-center gap-1'>
            <AssetImage asset={depositAsset} className='w-5 h-5' />
            <DisplayCurrency
              coin={BNCoin.fromDenomAndBigNumber(
                details.base_tokens_denom,
                BN(userVaultTokensAmount),
              )}
              className='text-2xl'
            />
          </div>
        )
      }
      subtitle={
        <FormattedNumber
          amount={sharePercentage}
          options={{
            suffix: '% of the vault',
            minDecimals: 0,
            maxDecimals: 0,
            abbreviated: false,
          }}
          className='text-xs text-white/60'
        />
      }
      primaryButton={{
        text: 'Deposit',
        onClick: onDeposit,
      }}
      secondaryButton={{
        text: 'Unlock',
        color: 'secondary',
        onClick: onWithdraw,
        rightIcon: <LockUnlocked />,
        disabled: !userVaultTokensAmount,
      }}
      isOwner={isOwner}
      type='depositPosition'
    />
  )
}
