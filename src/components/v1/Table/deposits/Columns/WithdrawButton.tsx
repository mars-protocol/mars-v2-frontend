import useStore from '../../../../../store'
import ActionButton from '../../../../common/Button/ActionButton'
import { ArrowDownLine } from '../../../../common/Icons'

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
          useStore.setState({
            v1DepositAndWithdrawModal: { type: 'withdraw', data: props.data },
          }),
            e.stopPropagation()
        }}
        text='Withdraw'
        short
      />
    </div>
  )
}
