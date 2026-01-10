import ActionButton from 'components/common/Button/ActionButton'
import { Plus } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useV1Account from 'hooks/v1/useV1Account'
import useStore from 'store'

interface Props {
  data: BorrowMarketTableData
}
export default function BorrowButton(props: Props) {
  const address = useStore((s) => s.address)
  const { data: account } = useV1Account()

  const hasCollateral = account?.lends?.length ?? 0 > 0

  return (
    <div className='flex justify-end'>
      <ConditionalWrapper
        condition={!hasCollateral && !!address}
        wrapper={(children) => (
          <Tooltip
            type='warning'
            content={
              <Text size='sm'>
                You don't have assets deposited in the Red Bank. Please deposit assets before you
                borrow.
              </Text>
            }
            contentClassName='max-w-[200px]'
            className='ml-auto'
          >
            {children}
          </Tooltip>
        )}
      >
        <ActionButton
          leftIcon={<Plus />}
          disabled={!hasCollateral}
          color='tertiary'
          onClick={(e) => {
            useStore.setState({
              v1BorrowAndRepayModal: { type: 'borrow', data: props.data },
            })
            e.stopPropagation()
          }}
          text='Borrow'
          short
        />
      </ConditionalWrapper>
    </div>
  )
}
