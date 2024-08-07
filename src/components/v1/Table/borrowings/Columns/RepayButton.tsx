import ActionButton from 'components/common/Button/ActionButton'
import { HandCoins } from 'components/common/Icons'
import Text from 'components/common/Text'
import { Tooltip } from 'components/common/Tooltip'
import ConditionalWrapper from 'hocs/ConditionalWrapper'
import useWalletBalances from 'hooks/wallet/useWalletBalances'
import useStore from 'store'
import { byDenom } from 'utils/array'

interface Props {
  data: BorrowMarketTableData
}
export default function RepayButton(props: Props) {
  const address = useStore((s) => s.address)
  const { data: balances } = useWalletBalances(address)
  const hasBalance = !!balances.find(byDenom(props.data.asset.denom))

  return (
    <div className='flex justify-end'>
      <ConditionalWrapper
        condition={!hasBalance && !!address}
        wrapper={(children) => (
          <Tooltip
            type='warning'
            content={
              <Text size='sm'>{`You don’t have any ${props.data.asset.symbol} in your Wallet.`}</Text>
            }
            contentClassName='max-w-[200px]'
            className='ml-auto'
          >
            {children}
          </Tooltip>
        )}
      >
        <ActionButton
          leftIcon={<HandCoins />}
          color='tertiary'
          onClick={(e) => {
            useStore.setState({
              v1BorrowAndRepayModal: { type: 'repay', data: props.data },
            })
            e.stopPropagation()
          }}
          disabled={!hasBalance}
          text='Repay'
          short
        />
      </ConditionalWrapper>
    </div>
  )
}
