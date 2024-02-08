import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useAsset from 'hooks/assets/useAsset'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'

interface Props {
  amount: BigNumber
  balances: BNCoin[]
  denom: string
  isConfirming: boolean
  updateFundingAssets: (amount: BigNumber, denom: string) => void
  onDebounce: () => void
}

export default function AccountFundRow(props: Props) {
  const asset = useAsset(props.denom)

  if (!asset) return null

  const balance = props.balances.find(byDenom(props.denom))?.amount ?? BN_ZERO

  return (
    <TokenInputWithSlider
      asset={asset}
      onChange={(amount) => props.updateFundingAssets(amount, asset.denom)}
      onDebounce={props.onDebounce}
      amount={props.amount}
      max={balance}
      balances={props.balances}
      maxText='Max'
      disabled={props.isConfirming}
      warningMessages={[]}
    />
  )
}
