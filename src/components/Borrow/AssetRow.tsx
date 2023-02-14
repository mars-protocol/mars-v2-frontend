import Image from 'next/image'
import React, { useState } from 'react'

import { ChevronDown, ChevronUp } from 'components/Icons'
import { formatCurrency } from 'utils/formatters'
import { Button } from 'components/Button'

type AssetRowProps = {
  data: {
    denom: string
    symbol: string
    logo: string
    name: string
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

export const AssetRow = ({ data, onBorrowClick, onRepayClick }: AssetRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div
      className='cursor-pointer rounded-md px-4 py-2 hover:bg-black/30'
      onClick={() => setIsExpanded((current) => !current)}
    >
      <div className='flex'>
        <div className='flex flex-1 items-center'>
          <Image src={data.logo} alt='token' width={32} height={32} />
          <div className='pl-2'>
            <div>{data.symbol}</div>
            <div className='text-xs'>{data.name}</div>
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
          <div className='w-5'>{isExpanded ? <ChevronUp /> : <ChevronDown />}</div>
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
