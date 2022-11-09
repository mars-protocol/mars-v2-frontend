import React from 'react'

import Card from 'components/Card'

const Trade = () => {
  return (
    <div>
      <div className='flex gap-4 mb-4'>
        <Card className='flex-1'>Graph/Tradingview Module</Card>
        <div className='flex flex-col gap-4'>
          <Card>Buy/Sell module</Card>
          <Card>Orderbook module (optional)</Card>
        </div>
        <Card>Credit Account essential module</Card>
      </div>
      <Card>Trader order overview</Card>
    </div>
  )
}

export default Trade
