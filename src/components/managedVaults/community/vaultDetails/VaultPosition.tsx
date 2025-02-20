import DisplayCurrency from 'components/common/DisplayCurrency'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { ArrowDownLine } from 'components/common/Icons'
import Text from 'components/common/Text'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { useManagedVaultUserShares } from 'hooks/managedVaults/useManagedVaultUserShares'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { BN } from 'utils/helpers'
import PositionInfo from './common/PositionInfo'

interface Props {
  totalVaultTokens: string
  baseDenom: string
  tokenDenom: string
  isOwner: boolean
  onDeposit: () => void
  onWithdraw: () => void
}

export default function VaultPosition(props: Props) {
  const { totalVaultTokens, baseDenom, isOwner, tokenDenom, onDeposit, onWithdraw } = props

  const address = useStore((s) => s.address)
  const { amount, calculateVaultShare } = useManagedVaultUserShares(address, tokenDenom)
  const sharePercentage = calculateVaultShare(totalVaultTokens)
  const noDeposits = amount === '0'

  return (
    <PositionInfo
      value={
        noDeposits ? (
          <Text>No deposits</Text>
        ) : (
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(
              baseDenom,
              BN(amount).shiftedBy(-PRICE_ORACLE_DECIMALS),
            )}
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
        text: 'Withdraw',
        color: 'secondary',
        onClick: onWithdraw,
        rightIcon: <ArrowDownLine />,
        disabled: noDeposits,
      }}
      isOwner={isOwner}
    />
  )
}
