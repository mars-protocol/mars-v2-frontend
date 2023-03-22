import Image from 'next/image'
import { useCallback, useState } from 'react'
import BigNumber from 'bignumber.js'

import { Modal } from 'components/Modal'
import TitleAndSubCell from 'components/TitleAndSubCell'
import useStore from 'store'
import { Text } from 'components/Text'
import { formatPercent, formatValue } from 'utils/formatters'
import Slider from 'components/Slider'
import AccountSummary from 'components/Account/AccountSummary'
import Card from 'components/Card'
import Divider from 'components/Divider'
import TokenInput from 'components/TokenInput'
import { Button } from 'components/Button'
import { ArrowRight } from 'components/Icons'

export default function BorrowModal() {
  const modal = useStore((s) => s.borrowModal)
  const [percentage, setPercentage] = useState(0)
  const [value, setValue] = useState(0)

  const onSliderChange = useCallback(
    (percentage: number) => onPercentageChange(percentage),
    [onPercentageChange],
  )
  const onInputChange = useCallback((value: number) => onValueChange(value), [onValueChange])

  function setOpen(isOpen: boolean) {
    useStore.setState({ borrowModal: null })
  }

  function onBorrowClick() {}

  function onPercentageChange(percentage: number) {
    setPercentage(percentage)
    setValue(new BigNumber(percentage).div(100).times(liquidityAmount).toNumber())
  }

  function onValueChange(value: number) {
    setValue(value)
    setPercentage(new BigNumber(value).div(liquidityAmount).times(100).toNumber())
  }

  if (!modal) return null

  const liquidityAmount = Number(modal.marketData.liquidity?.amount || 0)
  const liquidityAmountString: string = formatValue(liquidityAmount, {
    abbreviated: true,
    decimals: 6,
  })

  const liquidityValue = Number(modal.marketData.liquidity?.value || 0)
  const liquidityValueString: string = formatValue(liquidityValue, {
    abbreviated: true,
    decimals: 6,
  })

  return (
    <Modal
      open={true}
      setOpen={setOpen}
      header={
        <span className='flex items-center gap-4 px-4'>
          <Image src={modal?.asset.logo} alt='token' width={24} height={24} />
          <Text>Borrow {modal.asset.symbol}</Text>
        </span>
      }
      headerClassName='gradient-header pl-2 pr-2.5 py-2.5 border-b-white/5 border-b'
      contentClassName='flex flex-col'
    >
      <div className='flex gap-3 border-b border-b-white/5 px-6 py-4 gradient-header'>
        <TitleAndSubCell
          title={formatPercent(modal.marketData.borrowRate || '0')}
          sub={'Borrow rate'}
        />
        <div className='h-100 w-[1px] bg-white/10'></div>
        <TitleAndSubCell title={'$0'} sub={'Borrowed'} />
        <div className='h-100 w-[1px] bg-white/10'></div>
        <TitleAndSubCell
          title={`${liquidityAmountString} (${liquidityValueString})`}
          sub={'Liquidity available'}
        />
      </div>
      <div className='flex items-start gap-6 p-6'>
        <Card className='w-full bg-white/5 p-4' contentClassName='gap-6 flex flex-col'>
          <TokenInput
            asset={modal.asset}
            onChange={onInputChange}
            value={value}
            max={liquidityAmount}
          />
          <Slider value={percentage} onChange={onSliderChange} />
          <Divider />
          <Button
            onClick={onBorrowClick}
            className='w-full'
            text='Borrow'
            rightIcon={<ArrowRight />}
          />
        </Card>
        <AccountSummary />
      </div>
    </Modal>
  )
}
