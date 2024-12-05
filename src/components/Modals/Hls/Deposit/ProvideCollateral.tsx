import Button from 'components/common/Button'
import { ArrowRight } from 'components/common/Icons'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'

interface Props {
  amount: BigNumber
  asset: Asset
  max: BigNumber
  onChangeAmount: (amount: BigNumber) => void
  onClickBtn: () => void
  warningMessages: string[]
}

export default function ProvideCollateral(props: Props) {
  const { amount, asset, max, onChangeAmount, onClickBtn, warningMessages } = props
  return (
    <div id='item-0' className='flex flex-col gap-6 p-4'>
      <TokenInputWithSlider
        maxText='In wallet'
        amount={amount}
        asset={asset}
        max={max}
        onChange={onChangeAmount}
        warningMessages={warningMessages}
      />
      <Button
        onClick={onClickBtn}
        disabled={warningMessages.length !== 0}
        text='Continue'
        rightIcon={<ArrowRight />}
      />
    </div>
  )
}
