import { useCallback } from 'react'

import ActionButton from 'components/Button/ActionButton'
import SummaryLine from 'components/SummaryLine'
import Text from 'components/Text'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'

type Props = {
  amount: BigNumber
  tradeDirection: TradeDirection
  asset: Asset
}

export default function PerpsSummary(props: Props) {
  const openPerpPosition = useStore((s) => s.openPerpPosition)
  const currentAccount = useCurrentAccount()

  const onConfirm = useCallback(async () => {
    if (!currentAccount) return
    await openPerpPosition({
      accountId: currentAccount.id,
      coin: BNCoin.fromDenomAndBigNumber(
        props.asset.denom,
        props.amount.times(props.tradeDirection === 'short' ? -1 : 1),
      ),
    })
  }, [currentAccount, openPerpPosition, props.amount, props.asset.denom, props.tradeDirection])

  return (
    <div className='border border-white/10 rounded-sm bg-white/5'>
      <div className='py-4 px-3 flex flex-col gap-1'>
        <Text size='xs' className='font-bold mb-2'>
          Summary
        </Text>
        <SummaryLine label='Expected Price'>Something</SummaryLine>
        <SummaryLine label='Fees'>Something</SummaryLine>
        <SummaryLine label='Total'>Something</SummaryLine>
      </div>
      <ActionButton onClick={onConfirm} className='w-full py-2.5'>
        <span className='capitalize mr-1'>{props.tradeDirection}</span>
        {props.asset.symbol}
      </ActionButton>
    </div>
  )
}
