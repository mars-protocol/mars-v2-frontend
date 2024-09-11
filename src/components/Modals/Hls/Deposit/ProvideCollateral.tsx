import Button from '../../../common/Button'
import { ArrowRight } from '../../../common/Icons'
import TokenInputWithSlider from '../../../common/TokenInput/TokenInputWithSlider'

interface Props {
  amount: BigNumber
  asset: Asset
  max: BigNumber
  onChangeAmount: (amount: BigNumber) => void
  onClickBtn: () => void
  depositCapLeft: BigNumber
  warningMessages: string[]
}

export default function ProvideCollateral(props: Props) {
  return (
    <div id='item-0' className='p-4 flex-col gap-6 flex'>
      <TokenInputWithSlider
        maxText='In wallet'
        amount={props.amount}
        asset={props.asset}
        max={props.max}
        onChange={props.onChangeAmount}
        warningMessages={props.warningMessages}
      />
      <Button onClick={props.onClickBtn} text='Continue' rightIcon={<ArrowRight />} />
    </div>
  )
}
