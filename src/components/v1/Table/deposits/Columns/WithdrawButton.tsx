import ActionButton from 'components/common/Button/ActionButton'
import { ArrowDownLine } from 'components/common/Icons'
import useStore from 'store'

interface Props {
  data: LendingMarketTableData
}
export default function WithdrawButton(props: Props) {
  return (
    <div className='flex justify-end'>
      <ActionButton
        leftIcon={<ArrowDownLine />}
        color='tertiary'
        onClick={(e) => {
          ;(useStore.setState({
            v1DepositAndWithdrawModal: { type: 'withdraw', data: props.data },
          }),
            e.stopPropagation())
        }}
        text='Withdraw'
        short
      />
    </div>
  )
}
