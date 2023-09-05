import { useCallback, useEffect, useMemo, useState } from 'react'

import AssetBalanceRow from 'components/AssetBalanceRow'
import Button from 'components/Button'
import DisplayCurrency from 'components/DisplayCurrency'
import Divider from 'components/Divider'
import { Logo } from 'components/Icons'
import Overlay from 'components/Overlay'
import Text from 'components/Text'
import { ASSETS } from 'constants/assets'
import { DEFAULT_SETTINGS } from 'constants/defaultSettings'
import { DISPLAY_CURRENCY_KEY } from 'constants/localStore'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useLocalStorage from 'hooks/useLocalStorage'
import usePrices from 'hooks/usePrices'
import useToggle from 'hooks/useToggle'
import useUnclaimedRewards from 'hooks/useUnclaimedRewards'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { defaultFee } from 'utils/constants'
import { formatAmountWithSymbol, getCoinValue } from 'utils/formatters'
import { ORACLE_DENOM } from 'constants/oracle'

const renderIncentives = (unclaimedRewards: BNCoin[]) => {
  if (unclaimedRewards.length === 0)
    return (
      <Text className='w-full px-4 text-center' size='sm'>
        You have no claimable rewards.
      </Text>
    )

  return unclaimedRewards.map((reward, index) => {
    const asset = ASSETS.find(byDenom(reward.denom))
    if (!asset) return null
    return (
      <>
        {index !== 0 && <Divider />}
        <AssetBalanceRow key={reward.denom} coin={reward} asset={asset} />
      </>
    )
  })
}

export default function RewardsCenter() {
  const account = useCurrentAccount()
  const accountId = account?.id
  const [isConfirming, setIsConfirming] = useState(false)
  const [estimatedFee, setEstimatedFee] = useState(defaultFee)
  const [showRewardsCenter, setShowRewardsCenter] = useToggle()
  const [displayCurrency] = useLocalStorage<string>(
    DISPLAY_CURRENCY_KEY,
    DEFAULT_SETTINGS.displayCurrency,
  )
  const claimRewards = useStore((s) => s.claimRewards)
  const { data: prices } = usePrices()
  const { data: unclaimedRewards } = useUnclaimedRewards()

  const totalRewardsCoin = useMemo(() => {
    let total = 0
    unclaimedRewards.forEach((reward) => {
      total = total + getCoinValue(reward, prices).toNumber()
    })

    return new BNCoin({
      denom: ORACLE_DENOM,
      amount: total.toString(),
    })
  }, [prices, unclaimedRewards])

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
    if (accountId) {
      setIsConfirming(true)

      await claimTx.execute()
      setIsConfirming(false)
    }
  }, [accountId, claimTx])

  return (
    <div className={'relative'}>
      <Button
        variant='solid'
        color='tertiary'
        leftIcon={<Logo />}
        onClick={() => {
          setShowRewardsCenter(!showRewardsCenter)
        }}
        hasFocus={showRewardsCenter}
      >
        <div className='relative flex items-center h-fullx'>
          <DisplayCurrency coin={totalRewardsCoin} />
        </div>
      </Button>
      <Overlay className={'mt-2 right-0'} show={showRewardsCenter} setShow={setShowRewardsCenter}>
        <div className='flex w-[402px] flex-wrap'>
          <Text size='lg' className='w-full px-4 py-5 rounded-t-base bg-white/10'>
            Rewards Center
          </Text>
          <div className='w-full p-4'>
            <div className='flex flex-wrap w-full gap-4 pb-4'>
              {renderIncentives(unclaimedRewards)}
            </div>
            {hasIncentives && (
              <>
                <Button
                  variant='solid'
                  color='secondary'
                  className='w-full py-2'
                  showProgressIndicator={isConfirming}
                  text={'Claim total account rewards'}
                  onClick={handleClaim}
                />
                <Text className='w-full py-4 text-center text-white/50' size='sm'>
                  Tx Fee: {formatAmountWithSymbol(estimatedFee.amount[0])}
                </Text>
              </>
            )}
          </div>
        </div>
      </Overlay>
    </div>
  )
}
