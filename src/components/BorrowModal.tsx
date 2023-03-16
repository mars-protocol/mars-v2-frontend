import { Modal } from 'components/Modal'
import TitleAndSubCell from 'components/TitleAndSubCell'
import useStore from 'store'
import Image from 'next/image'
import { Text } from 'components/Text'
import { formatPercent, formatValue } from 'utils/formatters'
import Slider from './Slider'
import { useCallback, useState } from 'react'

export default function BorrowModal() {
  const modal = useStore((s) => s.borrowModal)
  const [sliderValue, setSliderValue] = useState(0)

  function setOpen(isOpen: boolean) {
    useStore.setState({ borrowModal: null })
  }

  if (!modal) return null

  const liquidityAmount: string = formatValue(modal.marketData.liquidity?.amount || '0', {
    abbreviated: true,
    decimals: 6,
  })

  const liquidityValue: string = formatValue(modal.marketData.liquidity?.value || '0', {
    abbreviated: true,
    decimals: 6,
  })

  return (
    <Modal
      open={true}
      setOpen={setOpen}
      title={
        <span className='flex items-center gap-4'>
          <Image src={modal?.asset.logo} alt='token' width={24} height={24} />
          <Text>Borrow {modal.asset.symbol}</Text>
        </span>
      }
    >
      <div className='flex gap-3'>
        <TitleAndSubCell
          title={formatPercent(modal.marketData.borrowRate || '0')}
          sub={'Borrow rate'}
        />
        <div className='h-100 w-[1px] bg-white/10'></div>
        <TitleAndSubCell title={'$0'} sub={'Borrowed'} />
        <div className='h-100 w-[1px] bg-white/10'></div>
        <TitleAndSubCell
          title={`${liquidityAmount} (${liquidityValue})`}
          sub={'Liquidity available'}
        />
      </div>
      <div className='flex'>
        <Slider
          value={sliderValue}
          onChange={useCallback((value: number) => setSliderValue(value), [])}
        />
      </div>
    </Modal>
  )
}
