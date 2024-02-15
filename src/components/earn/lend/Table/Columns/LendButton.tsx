import ActionButton from 'components/common/Button/ActionButton'
import { ArrowUpLine } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useAccountId from 'hooks/useAccountId'
import useCurrentAccountDeposits from 'hooks/useCurrentAccountDeposits'
import useLendAndReclaimModal from 'hooks/useLendAndReclaimModal'
import useStore from 'store'
import { byDenom } from 'utils/array'

export const LEND_BUTTON_META = {
  accessorKey: 'lend',
  enableSorting: false,
  header: '',
}

interface Props {
  data: LendingMarketTableData
}
export default function LendButton(props: Props) {
  const { openLend } = useLendAndReclaimModal()
  const accountDeposits = useCurrentAccountDeposits()
  const assetDepositAmount = accountDeposits.find(byDenom(props.data.asset.denom))?.amount
  const address = useStore((s) => s.address)
  const accountId = useAccountId()
  const hasNoDeposit = !!(!assetDepositAmount && address && accountId)

  return (
    <div className='flex justify-end'>
      <ConditionalWrapper
        condition={hasNoDeposit}
        wrapper={(children) => (
          <Tooltip
            type='warning'
            content={
              <Text size='sm'>{`You don’t have any ${props.data.asset.symbol}.
             Please first deposit ${props.data.asset.symbol} into your Credit Account before lending.`}</Text>
            }
            contentClassName='max-w-[200px]'
            className='ml-auto'
          >
            {children}
          </Tooltip>
        )}
      >
        <ActionButton
          leftIcon={<ArrowUpLine />}
          disabled={hasNoDeposit}
          color='tertiary'
          onClick={(e) => {
            openLend(props.data)
            e.stopPropagation()
          }}
          text='Lend'
        />
      </ConditionalWrapper>
    </div>
  )
}
