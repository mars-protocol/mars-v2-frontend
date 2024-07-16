import classNames from 'classnames'
import { useCallback, useMemo, useState } from 'react'

import Button from 'components/common/Button'
import DisplayCurrency from 'components/common/DisplayCurrency'
import Divider from 'components/common/Divider'
import { Logo } from 'components/common/Icons'
import Overlay from 'components/common/Overlay'
import Text from 'components/common/Text'
import AssetBalanceRow from 'components/common/assets/AssetBalanceRow'
import { BN_ZERO } from 'constants/math'
import { ORACLE_DENOM } from 'constants/oracle'
import useAccountId from 'hooks/accounts/useAccountId'
import useAssets from 'hooks/assets/useAssets'
import useToggle from 'hooks/common/useToggle'
import useUnclaimedRewards from 'hooks/incentives/useUnclaimedRewards'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { getCoinValue } from 'utils/formatters'

interface Props {
  className?: string
}
export default function RewardsCenter(props: Props) {
  const accountId = useAccountId()
  const [showRewardsCenter, setShowRewardsCenter] = useToggle()
  const [isConfirming, setIsConfirming] = useState(false)
  const { data: unclaimedRewards } = useUnclaimedRewards()
  const { data: assets } = useAssets()
  const totalRewardsCoin = useMemo(() => {
    const coin = BNCoin.fromDenomAndBigNumber(ORACLE_DENOM, BN_ZERO)
    unclaimedRewards.forEach((reward) => {
      const value = getCoinValue(reward, assets)
      coin.amount = coin.amount.plus(value)
    })
    return coin
  }, [assets, unclaimedRewards])

  const claimRewards = useStore((s) => s.claimRewards)

  const handleClick = useCallback(async () => {
    setIsConfirming(true)
    await claimRewards({
      accountId: accountId || '',
    })
    setIsConfirming(false)
  }, [])

  return (
    <div className={classNames('relative', props.className)}>
      <Button
        variant='solid'
        color='secondary'
        leftIcon={<Logo />}
        onClick={() => {
          setShowRewardsCenter(!showRewardsCenter)
        }}
        hasFocus={showRewardsCenter}
      >
        <div className='relative flex items-center h-fullx'>
          <DisplayCurrency coin={totalRewardsCoin} allowZeroAmount />
        </div>
      </Button>
      <Overlay
        className={'mt-2 right-0 top-8 w-[320px] flex flex-wrap'}
        show={showRewardsCenter}
        setShow={setShowRewardsCenter}
      >
        <div
          className={classNames(
            'flex h-[54px] w-full items-center justify-between bg-white/5 px-4 py-3',
            'border border-transparent border-b-white/10',
          )}
        >
          <Text size='lg' className='font-bold'>
            Rewards Center
          </Text>
        </div>
        <div className='flex flex-col w-full gap-4 px-4 py-5'>
          <Text size='xs' className='w-full'>
            Total Rewards
          </Text>
          <div className='flex flex-wrap content-center justify-center w-full gap-1 p-4 rounded-lg bg-black/20'>
            <DisplayCurrency coin={totalRewardsCoin} allowZeroAmount className='text-lg' />
            <Text size='xs' className='w-full text-center text-white/60'>
              Unclaimed Rewards
            </Text>
          </div>
          {unclaimedRewards.length > 0 &&
            unclaimedRewards.map((reward, index) => {
              const asset = assets.find(byDenom(reward.denom))
              if (!asset) return null
              return (
                <div className='w-full' key={index}>
                  {index !== 0 && <Divider />}
                  <AssetBalanceRow key={reward.denom} coin={reward} asset={asset} />
                </div>
              )
            })}
          <Button
            className='w-full'
            onClick={() => handleClick()}
            disabled={totalRewardsCoin.amount.isZero()}
            showProgressIndicator={isConfirming}
          >
            Claim All Rewards
          </Button>
        </div>
      </Overlay>
    </div>
  )
}
