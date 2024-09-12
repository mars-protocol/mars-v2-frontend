import { useCallback, useMemo, useState } from 'react'

import classNames from 'classnames'
import AccountSummaryInModal from 'components/account/AccountSummary/AccountSummaryInModal'
import AssetBalanceRow from 'components/common/assets/AssetBalanceRow'
import Button from 'components/common/Button'
import { Callout, CalloutType } from 'components/common/Callout'
import Card from 'components/common/Card'
import Text from 'components/common/Text'
import TokenInputWithSlider from 'components/common/TokenInput/TokenInputWithSlider'
import { BN_ZERO } from 'constants/math'
import useAssets from 'hooks/assets/useAssets'
import useStakedAstroLpRewards from 'hooks/incentives/useStakedAstroLpRewards'
import useStore from 'store'
import { useSWRConfig } from 'swr'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import checkAutoLendEnabled from 'utils/checkAutoLendEnabled'

interface Props {
  account: Account
  astroLp: DepositedAstroLp
  simulateUnstakeAstroLp: (
    isAutoLend: boolean,
    BNCoin: BNCoin,
    astroLp: DepositedAstroLp,
    currentLpRewards: BNCoin[],
  ) => void
  type: FarmModal['type']
}

export default function AstroLpWithdraw(props: Props) {
  const { account, astroLp, simulateUnstakeAstroLp } = props

  const { mutate } = useSWRConfig()
  const { data: assets } = useAssets()
  const astroLpAsset = assets.find(byDenom(astroLp.denoms.lp))
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
  const primaryAsset = assets.find(byDenom(astroLp.denoms.primary))
  const secondaryAsset = assets.find(byDenom(astroLp.denoms.secondary))
  const { data: stakedAstroLpRewards } = useStakedAstroLpRewards(astroLp.denoms.lp)

  const currentLpRewards = useMemo(() => {
    if (stakedAstroLpRewards.length === 0) return []
    return stakedAstroLpRewards[0].rewards
  }, [stakedAstroLpRewards])

  const onChange = useCallback(
    (amount: BigNumber) => {
      if (withdrawAmount.isEqualTo(amount)) return
      setWithdrawAmount(amount)
      simulateUnstakeAstroLp(
        isAutoLend,
        BNCoin.fromDenomAndBigNumber(astroLp.denoms.lp, amount),
        astroLp,
        currentLpRewards,
      )
    },
    [isAutoLend, astroLp, simulateUnstakeAstroLp, withdrawAmount, currentLpRewards],
  )

  const onClick = useCallback(async () => {
    useStore.setState({
      farmModal: null,
    })
    await withdrawFromAstroLps({
      accountId: account.id,
      astroLps: [props.astroLp],
      amount: withdrawAmount.toString(),
    })
    await mutate(`chains/${chainConfig.id}/accounts/${account.id}`)
    await mutate(`chains/${chainConfig.id}/astroLps/${account.id}/staked-astro-lp-rewards`)
  }, [account.id, chainConfig.id, mutate, props.astroLp, withdrawAmount, withdrawFromAstroLps])

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
        <div className='flex flex-wrap w-full gap-2'>
          <TokenInputWithSlider
            amount={withdrawAmount}
            asset={astroLpAsset}
            max={astroLpPosition.amount}
            onChange={onChange}
            maxText='Available'
            warningMessages={[]}
            className='w-full'
          />
          {primaryAsset && secondaryAsset && (
            <>
              <Text size='xs' className='mt-4'>
                Tokens Returned
              </Text>
              <AssetBalanceRow
                className='w-full'
                asset={primaryAsset}
                coin={BNCoin.fromDenomAndBigNumber(
                  primaryAsset.denom,
                  withdrawAmount.times(astroLp.assetsPerShare.primary),
                )}
                small
                hideBalances
              />
              <AssetBalanceRow
                className='w-full'
                asset={secondaryAsset}
                coin={BNCoin.fromDenomAndBigNumber(
                  secondaryAsset.denom,
                  withdrawAmount.times(astroLp.assetsPerShare.secondary),
                )}
                small
                hideBalances
              />
            </>
          )}
          {currentLpRewards.length > 0 && (
            <>
              <Text size='xs' className='mt-4'>
                Rewards
              </Text>
              {currentLpRewards.map((reward) => (
                <AssetBalanceRow
                  key={reward.denom}
                  asset={assets.find(byDenom(reward.denom))!}
                  coin={reward}
                  small
                  hideBalances
                />
              ))}
              <Callout type={CalloutType.INFO} className='mt-4'>
                Note: when withdrawing any amount of LP shares, all accrued rewards will be
                automatically claimed to your Credit Account.
              </Callout>
            </>
          )}
        </div>
        <Button onClick={onClick} text='Withdraw' disabled={withdrawAmount.isZero()} />
      </Card>
      <AccountSummaryInModal account={account} isHls={false} />
    </div>
  )
}
