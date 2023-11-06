import { useMemo } from 'react'

import Button from 'components/Button'
import SummaryItems from 'components/SummaryItems'
import TokenInputWithSlider from 'components/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/useUpdatedAccount'

interface Props {
  account: Account
  action: HlsStakingManageAction
  borrowAsset: Asset
  collateralAsset: Asset
}

export default function Repay(props: Props) {
  const {} = useUpdatedAccount(props.account)

  const items: SummaryItem[] = useMemo(
    () => [
      {
        title: 'Total Debt Repayable',
        amount: 1500,
        options: { suffix: ` ${props.borrowAsset.symbol}`, abbreviated: true },
      },
      {
        title: 'New Debt Amount',
        amount: 1000,
        options: { suffix: ` ${props.borrowAsset.symbol}`, abbreviated: true },
      },
    ],
    [props.borrowAsset.symbol],
  )

  return (
    <>
      <TokenInputWithSlider
        amount={BN_ZERO}
        asset={props.borrowAsset}
        max={BN_ZERO}
        onChange={() => {}}
        maxText='In Wallet'
      />
      <div className='flex flex-col gap-4'>
        <SummaryItems items={items} />
        <Button onClick={() => {}} text='Repay' />
      </div>
    </>
  )
}
