import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { LockUnlocked } from 'components/common/Icons'
import Text from 'components/common/Text'
import { useManagedVaultUserShares } from 'hooks/managedVaults/useManagedVaultUserShares'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import PositionInfo from 'components/managedVaults/community/vaultDetails/common/PositionInfo'
import { useManagedVaultConvertToTokens } from 'hooks/managedVaults/useManagedVaultConvertToTokens'

interface Props {
  details: ExtendedManagedVaultDetails
  vaultAddress: string
  isOwner: boolean
  onDeposit: () => void
  onWithdraw: () => void
}

export default function VaultPosition(props: Props) {
  const { details, isOwner, vaultAddress, onDeposit, onWithdraw } = props

  const address = useStore((s) => s.address)
  const { amount: userVaultShares, calculateVaultShare } = useManagedVaultUserShares(
    address,
    details.vault_token,
  )
  const { data: userVaultTokens } = useManagedVaultConvertToTokens(vaultAddress, userVaultShares)
  const sharePercentage = calculateVaultShare(details.total_vault_tokens)

  return (
    <PositionInfo
      value={
        !userVaultTokens ? (
          <Text>No deposits</Text>
        ) : (
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(details.base_token, BN(userVaultTokens))}
            className='text-2xl'
          />
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
        disabled: !userVaultTokens,
      }}
      isOwner={isOwner}
    />
  )
}
