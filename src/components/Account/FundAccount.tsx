'use client'

import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'

import { Button } from 'components/Button'
import { ArrowRight, Cross } from 'components/Icons'
import Slider from 'components/Slider'
import SwitchWithLabel from 'components/SwitchWithLabel'
import { Text } from 'components/Text'
import TokenInput from 'components/TokenInput'
import { ASSETS } from 'constants/assets'
import useParams from 'hooks/useParams'
import useStore from 'store'
import { hardcodedFee } from 'utils/contants'

interface Props {
  setShow: (show: boolean) => void
}

export default function FundAccount(props: Props) {
  const params = useParams()
  const deposit = useStore((s) => s.deposit)

  const [percentage, setPercentage] = useState(0)
  const [amount, setAmount] = useState(0)
  const [isLending, setIsLending] = useState(false)
  const [fundAccount, setFundAccount] = useState(false)

  const onSliderChange = useCallback((percentage: number, liquidityAmount: number) => {
    setPercentage(percentage)
    setAmount(new BigNumber(percentage).div(100).times(liquidityAmount).toNumber())
  }, [])

  const onInputChange = useCallback((amount: number, liquidityAmount: number) => {
    setAmount(amount)
    setPercentage(new BigNumber(amount).div(liquidityAmount).times(100).toNumber())
  }, [])

  function handleLendAssets(val: boolean) {
    setIsLending(val)
    /* TODO: handle lending assets */
  }

  function onDeposit() {
    setFundAccount(true)
    deposit({
      fee: hardcodedFee,
      accountId: params.account,
      coin: {
        denom: ASSETS[0].denom,
        amount: amount.toString(),
      },
    })
  }

  return (
    <>
      <div className='absolute right-4 top-4'>
        <Button
          onClick={() => props.setShow(false)}
          leftIcon={<Cross />}
          className='h-8 w-8'
          iconClassName='h-2 w-2'
          color='tertiary'
        />
      </div>
      <div className='relative z-10 w-full p-4'>
        <Text size='lg' className='mb-2 font-bold'>
          {`Fund Account #${params.account}`}
        </Text>
        <Text className='mb-4 text-white/70'>
          Deposit assets from your Osmosis address to your Mars credit account. Bridge assets if
          your Osmosis address has no assets.
        </Text>
        <TokenInput
          asset={ASSETS[0]}
          onChange={(amount) => onInputChange(amount, 100)}
          amount={amount}
          max={100}
          className='mb-4'
          disabled={fundAccount}
        />
        <Slider
          value={percentage}
          onChange={(value) => onSliderChange(value, 100)}
          className='mb-4'
          disabled={fundAccount}
        />
        <div className='mb-4 w-full border-b border-white/10' />
        <SwitchWithLabel
          name='isLending'
          label='Lend assets to earn yield'
          value={isLending}
          onChange={handleLendAssets}
          className='mb-4'
          tooltip="Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your LTV. It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!"
          disabled={fundAccount || amount === 0}
        />
        <Button
          className='w-full'
          showProgressIndicator={fundAccount}
          disabled={amount === 0}
          text='Fund Account'
          rightIcon={<ArrowRight />}
          onClick={onDeposit}
        />
      </div>
    </>
  )
}
