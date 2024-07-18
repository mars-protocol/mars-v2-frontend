import { useCallback, useMemo, useState } from 'react'

import classNames from 'classnames'
import AccountSummaryInModal from 'components/account/AccountSummary/AccountSummaryInModal'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import { useUpdatedAccount } from 'hooks/accounts/useUpdatedAccount'
import useWhitelistedAssets from 'hooks/assets/useWhitelistedAssets'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import checkAutoLendEnabled from 'utils/checkAutoLendEnabled'

interface Props {
  account: Account
  astroLp: DepositedAstroLp
}

export default function Withdraw(props: Props) {
  const { account, astroLp } = props
  const astroLpAsset = useWhitelistedAssets().find(byDenom(astroLp.denoms.lp))
  const { simulateUnstakeAstroLp } = useUpdatedAccount(account)
  const [withdrawAmount, setWithdrawAmount] = useState(BN_ZERO)
  const withdrawFromAstroLps = useStore((s) => s.withdrawFromAstroLps)
  const chainConfig = useStore((s) => s.chainConfig)
  const isAutoLend = checkAutoLendEnabled(account.id, chainConfig.id)
  const astroLpPosition = useMemo(
    () =>
      account.stakedAstroLps.find((position) => position.denom === astroLp.denoms.lp) ??
      BNCoin.fromDenomAndBigNumber(astroLp.denoms.lp, BN_ZERO),
    [account, astroLp.denoms.lp],
  )

  const onChange = useCallback(
    (amount: BigNumber) => {
      if (withdrawAmount.isEqualTo(amount)) return
      setWithdrawAmount(amount)
      simulateUnstakeAstroLp(
        isAutoLend,
        BNCoin.fromDenomAndBigNumber(astroLp.denoms.lp, amount),
        astroLp,
      )
    },
    [isAutoLend, astroLp, simulateUnstakeAstroLp, withdrawAmount],
  )

  const onClick = useCallback(() => {
    withdrawFromAstroLps({
      accountId: account.id,
      astroLps: [props.astroLp],
      amount: withdrawAmount.toString(),
    })
    useStore.setState({
      astroLpModal: null,
    })
  }, [account.id, props.astroLp, withdrawAmount, withdrawFromAstroLps])

  if (!astroLpAsset) return null

  return (
    <div
      className={classNames(
        'flex items-start flex-1 p-2 gap-4 flex-wrap',
        'md:p-4 md:gap-6',
        'lg:flex-nowrap lg:p-6',
      )}
    >
      <Card
        className='flex flex-1 w-full p-4 bg-white/5 max-w-screen-full min-w-[200px]'
        contentClassName='gap-6 flex flex-col justify-between h-full min-h-[380px]'
      >
        <TokenInputWithSlider
          amount={withdrawAmount}
          asset={astroLpAsset}
          max={astroLpPosition.amount}
          onChange={onChange}
          maxText='Available'
          warningMessages={[]}
        />
        <Button onClick={onClick} text='Withdraw' disabled={withdrawAmount.isZero()} />
      </Card>
      <AccountSummaryInModal account={account} isHls={false} />
    </div>
  )
}
