import { useCallback, useMemo } from 'react'

import ActionButton from 'components/common/Button/ActionButton'
import { Plus } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useStore from 'store'

import { ChainInfoID } from 'types/enums'

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
  const chainConfig = useStore((s) => s.chainConfig)
  const hasNoDeposits = !account?.deposits?.length && !account?.lends?.length

  const isUSDC = useMemo(
    () => props.data.asset?.symbol?.toUpperCase().includes('USDC'),
    [props.data.asset?.symbol],
  )

  const isNeutron = chainConfig.id === ChainInfoID.Neutron1
  const isUSDCDisabled = isUSDC && isNeutron

  const isDisabled = hasNoDeposits || isUSDCDisabled

  const tooltipContent = useMemo(() => {
    if (isUSDCDisabled) {
      return 'USDC borrowing is temporarily disabled.'
    }
    if (hasNoDeposits) {
      return `You don't have any collateral. Please first deposit into your Credit Account before borrowing.`
    }
    return null
  }, [isUSDCDisabled, hasNoDeposits])

  const borrowHandler = useCallback(() => {
    if (!props.data.asset) return null
    useStore.setState({ borrowModal: { asset: props.data.asset, marketData: props.data } })
  }, [props.data])

  return (
    <div className='flex justify-end'>
      <ConditionalWrapper
        condition={isDisabled && !!address}
        wrapper={(children) => (
          <Tooltip
            type='warning'
            content={<Text size='sm'>{tooltipContent}</Text>}
            contentClassName='max-w-[200px]'
            className='ml-auto'
          >
            {children}
          </Tooltip>
        )}
      >
        <ActionButton
          leftIcon={<Plus />}
          disabled={isDisabled}
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
