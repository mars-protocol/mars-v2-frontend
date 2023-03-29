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
import { getMarketAssets } from 'utils/assets'
import { hardcodedFee } from 'utils/contants'
import { convertToGwei } from 'utils/formatters'

interface Props {
  setShowFundAccount: (showFundAccount: boolean) => void
}

export default function FundAccount(props: Props) {
  const params = useParams()
  const deposit = useStore((s) => s.deposit)

  const marketAssets = getMarketAssets()

  const [percentage, setPercentage] = useState(0)
  const [value, setValue] = useState(0)
  const [lendAssets, setLendAssets] = useState(false)
  const [fundAccount, setFundAccount] = useState(false)

  const onSliderChange = useCallback((percentage: number, liquidityAmount: number) => {
    setPercentage(percentage)
    setValue(new BigNumber(percentage).div(100).times(liquidityAmount).toNumber())
  }, [])

  const onInputChange = useCallback((value: number, liquidityAmount: number) => {
    setValue(value)
    setPercentage(new BigNumber(value).div(liquidityAmount).times(100).toNumber())
  }, [])

  function handleLendAssets(val: boolean) {
    setLendAssets(val)
  }

  function onDeposit() {
    setFundAccount(true)
    deposit({
      fee: hardcodedFee,
      accountId: params.account,
      coin: {
        denom: 'uosmo',
        amount: convertToGwei(value, ASSETS[0].denom, marketAssets).toString(),
      },
    })
  }

  return (
    <>
      <div className='absolute top-4 right-4'>
        <Button
          onClick={() => props.setShowFundAccount(false)}
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
          onChange={(value) => onInputChange(value, 100)}
          value={value}
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
          name='lendAssets'
          label='Lend assets to earn yield'
          value={lendAssets}
          changeHandler={handleLendAssets}
          className='mb-4'
          tooltip={`Fund your account and lend assets effortlessly! By lending, you'll earn attractive interest (APY) without impacting your LTV. It's a win-win situation - don't miss out on this easy opportunity to grow your holdings!`}
          disabled={fundAccount || value === 0}
        />
        <Button
          className='w-full'
          showProgressIndicator={fundAccount}
          disabled={value === 0}
          text='Fund Account'
          rightIcon={<ArrowRight />}
          onClick={onDeposit}
        />
      </div>
    </>
  )
}
