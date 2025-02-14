import DisplayCurrency from 'components/common/DisplayCurrency'
import PositionInfo from './common/PositionInfo'
import useStore from 'store'
import { ArrowDownLine } from 'components/common/Icons'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { useManagedVaultUserDeposits } from 'hooks/managedVaults/useManagedVaultUserDeposits'
import Text from 'components/common/Text'

interface Props {
  vaultAddress: string
  totalVaultTokens: string
  baseDenom: string
  isOwner: boolean
  onDeposit: () => void
  onWithdraw: () => void
}

export default function VaultDeposits(props: Props) {
  const { vaultAddress, totalVaultTokens, baseDenom, isOwner, onDeposit, onWithdraw } = props

  const address = useStore((s) => s.address)
  const { getVaultDeposit, calculateVaultShare } = useManagedVaultUserDeposits(address)
  const deposits = getVaultDeposit(vaultAddress)
  const vaultPercentage = calculateVaultShare(vaultAddress, totalVaultTokens)

  return (
    <PositionInfo
      value={
        deposits ? (
          <DisplayCurrency
            coin={BNCoin.fromDenomAndBigNumber(
              baseDenom,
              BN(deposits.amount).shiftedBy(-PRICE_ORACLE_DECIMALS),
            )}
            className='text-2xl'
          />
        ) : (
          <Text>No deposits</Text>
        )
      }
      subtitle={
        <FormattedNumber
          amount={vaultPercentage}
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
      }}
      isOwner={isOwner}
    />
  )
}
