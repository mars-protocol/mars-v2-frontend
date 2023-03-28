'use client'

import BigNumber from 'bignumber.js'
import { useCallback, useState } from 'react'

import { Button } from 'components/Button'
import { ArrowRight } from 'components/Icons'
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

export default function FundAccount() {
  const params = useParams()
  const deposit = useStore((s) => s.deposit)

  const marketAssets = getMarketAssets()

  const [percentage, setPercentage] = useState(0)
  const [value, setValue] = useState(0)
  const [lendAssets, setLendAssets] = useState(false)
  const [fundAccount, setFundAccount] = useState(false)

  function handleLendAssets(val: boolean) {
    setLendAssets(val)
  }

  const onSliderChange = useCallback(
    (percentage: number) => onPercentageChange(percentage),
    [onPercentageChange],
  )
  const onInputChange = useCallback((value: number) => onValueChange(value), [onValueChange])

  function onPercentageChange(percentage: number) {
    setPercentage(percentage)
    setValue(new BigNumber(percentage).div(100).times(100).toNumber())
  }

  function onValueChange(value: number) {
    setValue(value)
    setPercentage(new BigNumber(value).div(100).times(100).toNumber())
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
    <div className='relative z-10 w-full p-4'>
      <Text size='lg' className='mb-2 font-bold'>
        Fund your Account
      </Text>
      <Text className='mb-4 text-white/70'>
        Deposit assets from your Osmosis address to your Mars credit account. Bridge assets if your
        Osmosis address has no assets.
      </Text>
      <TokenInput
        asset={ASSETS[0]}
        onChange={onInputChange}
        value={value}
        max={100}
        className='mb-4'
        disabled={fundAccount}
      />
      <Slider
        value={percentage}
        onChange={onSliderChange}
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
        tooltip='Tooltip text'
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
  )
}
