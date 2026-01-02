import { useCallback, useMemo } from 'react'

import ActionButton from 'components/common/Button/ActionButton'
import { Plus } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useCurrentAccount from 'hooks/accounts/useCurrentAccount'
import useChainConfig from 'hooks/chain/useChainConfig'
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
  const chainConfig = useChainConfig()
  const isOsmosis = chainConfig.isOsmosis

  const isUSDC = useMemo(
    () => !isOsmosis && props.data.asset?.symbol?.toUpperCase().includes('USDC'),
    [props.data.asset?.symbol, isOsmosis],
  )

  const isDisabled = hasNoDeposits || isUSDC

  const tooltipContent = useMemo(() => {
    if (isUSDC) {
      return 'USDC borrowing is temporarily disabled.'
    }
    if (hasNoDeposits) {
      return `You don't have any collateral. Please first deposit into your Credit Account before borrowing.`
    }
    return null
  }, [isUSDC, hasNoDeposits])

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
