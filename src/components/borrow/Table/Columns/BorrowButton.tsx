import { useCallback } from 'react'

import ActionButton from 'components/common/Button/ActionButton'
import { Plus } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useStore from 'store'

export const BORROW_BUTTON_META = {
  accessorKey: 'borrow',
  enableSorting: false,
  header: '',
}

interface Props {
  data: LendingMarketTableData
}
export default function BorrowButton(props: Props) {
  const account = useCurrentAccount()
  const address = useStore((s) => s.address)
  const hasNoDeposits = !account?.deposits?.length && !account?.lends?.length

  const borrowHandler = useCallback(() => {
    if (!props.data.asset) return null
    useStore.setState({ borrowModal: { asset: props.data.asset, marketData: props.data } })
  }, [props.data])

  const isUSDCAxelar =
    props.data.asset.denom ===
    'ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858'

  if (isUSDCAxelar) return null
  return (
    <div className='flex justify-end'>
      <ConditionalWrapper
        condition={hasNoDeposits && !!address}
        wrapper={(children) => (
          <Tooltip
            type='warning'
            content={
              <Text size='sm'>{`You don’t have any collateral.
             Please first deposit into your Credit Account before borrowing.`}</Text>
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
          disabled={hasNoDeposits}
          color='tertiary'
          onClick={(e) => {
            borrowHandler()
            e.stopPropagation()
          }}
          text='Borrow'
          short
        />
      </ConditionalWrapper>
    </div>
  )
}
