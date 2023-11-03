import { FormattedNumber } from 'components/FormattedNumber'
import TitleAndSubCell from 'components/TitleAndSubCell'
import { VAULT_DEPOSIT_BUFFER } from 'constants/vaults'
import { getAssetByDenom } from 'utils/assets'

interface Props {
  depositCap: DepositCap
}

export default function DepositCapCell(props: Props) {
  const percent = props.depositCap.used
    .dividedBy(props.depositCap.max.multipliedBy(VAULT_DEPOSIT_BUFFER))
    .multipliedBy(100)
    .integerValue()

  const decimals = getAssetByDenom(props.depositCap.denom)?.decimals ?? 6

  return (
    <TitleAndSubCell
      title={
        <FormattedNumber
          amount={props.depositCap.max.toNumber()}
          options={{ minDecimals: 2, abbreviated: true, decimals }}
          className='text-xs'
          animate
        />
      }
      sub={
        <FormattedNumber
          amount={percent.toNumber()}
          options={{ minDecimals: 2, maxDecimals: 2, suffix: '% Filled' }}
          className='text-xs'
          animate
        />
      }
    />
  )
}
