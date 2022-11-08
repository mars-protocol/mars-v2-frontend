import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'
import Image from 'next/image'
import React, { useState } from 'react'

import Button from 'components/Button'
import { formatCurrency } from 'utils/formatters'

type AssetRowProps = {
  data: {
    denom: string
    symbol: string
    icon: string
    chain: string
    borrowed: {
      amount: number
      value: number
    } | null
    borrowRate: number
    marketLiquidity: number
  }
  onBorrowClick: () => void
  onRepayClick: () => void
}

const AssetRow = ({ data, onBorrowClick, onRepayClick }: AssetRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className='cursor-pointer rounded-md px-4 py-2 hover:bg-black/30'
      onClick={() => setIsExpanded((current) => !current)}
    >
      <div className='flex'>
        <div className='flex flex-1 items-center'>
          <Image src={data.icon} alt='token' width={32} height={32} />
          <div className='pl-2'>
            <div>{data.symbol}</div>
            <div className='text-xs'>{data.chain}</div>
          </div>
        </div>
        <div className='flex flex-1 items-center text-xs'>
          {data.borrowRate ? `${(data.borrowRate * 100).toFixed(2)}%` : '-'}
        </div>
        <div className='flex flex-1 items-center text-xs'>
          {data.borrowed ? (
            <div>
              <div className='font-bold'>{data.borrowed.amount}</div>
              <div>{formatCurrency(data.borrowed.value)}</div>
            </div>
          ) : (
            '-'
          )}
        </div>
        <div className='flex flex-1 items-center text-xs'>{data.marketLiquidity}</div>
        <div className='flex w-[50px] items-center justify-end'>
          {isExpanded ? <ChevronUpIcon className='w-5' /> : <ChevronDownIcon className='w-5' />}
        </div>
      </div>
      {isExpanded && (
        <div className='flex items-center justify-between'>
          <div>Additional Stuff Placeholder</div>
          <div className='flex gap-2'>
            <Button
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation()
                onBorrowClick()
              }}
            >
              Borrow
            </Button>
            <Button
              disabled={!data.borrowed}
              onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation()
                onRepayClick()
              }}
            >
              Repay
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AssetRow
