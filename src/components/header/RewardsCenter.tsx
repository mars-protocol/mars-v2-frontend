import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useState } from 'react'

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
import useAllAssets from 'hooks/assets/useAllAssets'
import useToggle from 'hooks/common/useToggle'
import useUnclaimedRewards from 'hooks/incentives/useUnclaimedRewards'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { defaultFee } from 'utils/constants'
import { formatAmountWithSymbol, getCoinValue } from 'utils/formatters'

interface Props {
  className?: string
}

const renderIncentives = (assets: Asset[], unclaimedRewards: BNCoin[]) => {
  if (unclaimedRewards.length === 0)
    return (
      <Text className='w-full px-4 text-center' size='sm'>
        You have no claimable rewards.
      </Text>
    )

  return unclaimedRewards.map((reward, index) => {
    const asset = assets.find(byDenom(reward.denom))
    if (!asset) return null
    return (
      <div className='w-full' key={index}>
        {index !== 0 && <Divider />}
        <AssetBalanceRow key={reward.denom} coin={reward} asset={asset} />
      </div>
    )
  })
}

export default function RewardsCenter(props: Props) {
  const accountId = useAccountId()
  const address = useStore((s) => s.address)
  const isV1 = useStore((s) => s.isV1)
  const [isConfirming, setIsConfirming] = useState(false)
  const [estimatedFee, setEstimatedFee] = useState(defaultFee)
  const [showRewardsCenter, setShowRewardsCenter] = useToggle()
  const claimRewards = useStore((s) => s.claimRewards)
  const { data: unclaimedRewards } = useUnclaimedRewards()
  const { data: assets } = useAllAssets()
  const totalRewardsCoin = useMemo(() => {
    let total = 0
    unclaimedRewards.forEach((reward) => {
      const value = getCoinValue(reward, assets) ?? BN_ZERO
      total = total + value.toNumber()
    })

    return new BNCoin({
      denom: ORACLE_DENOM,
      amount: total.toString(),
    })
  }, [assets, unclaimedRewards])

  const hasIncentives = unclaimedRewards.length > 0

  const claimTx = useMemo(() => {
    return claimRewards({
      accountId: accountId || '',
    })
  }, [accountId, claimRewards])

  useEffect(() => {
    claimTx.estimateFee().then(setEstimatedFee)
  }, [claimTx])

  const handleClaim = useCallback(async () => {
    if ((!isV1 && accountId) || (isV1 && address)) {
      setIsConfirming(true)

      await claimTx.execute()
      setIsConfirming(false)
    }
  }, [accountId, claimTx, isV1, address])

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
        className={'mt-2 right-0 top-8'}
        show={showRewardsCenter}
        setShow={setShowRewardsCenter}
      >
        <div className='flex w-[402px] flex-wrap'>
          <Text size='lg' className='w-full px-4 py-5 rounded-t-base bg-white/10'>
            Rewards Center
          </Text>
          <div className='w-full p-4'>
            <div className='flex flex-wrap w-full gap-4 pb-4'>
              {renderIncentives(assets, unclaimedRewards)}
            </div>
            {hasIncentives && (
              <>
                <Button
                  variant='solid'
                  color='tertiary'
                  className='w-full py-2'
                  showProgressIndicator={isConfirming}
                  text={isV1 ? 'Claim v1 rewards' : 'Claim total account rewards'}
                  onClick={handleClaim}
                />
                <Text className='w-full py-4 text-center text-white/50' size='sm'>
                  Tx Fee: {formatAmountWithSymbol(estimatedFee.amount[0], assets)}
                </Text>
              </>
            )}
          </div>
        </div>
      </Overlay>
    </div>
  )
}
