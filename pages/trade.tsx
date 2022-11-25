import React from 'react'

import Card from 'components/Card'
import TradeActionModule from 'components/Trade/TradeActionModule'

const Trade = () => {
  return (
    <div>
      <div className='mb-4 flex gap-4'>
        <Card className='flex-1'>Graph/Tradingview Module</Card>
        <div className='flex flex-col gap-4'>
          <Card><TradeActionModule /></Card>
          <Card>Orderbook module (optional)</Card>
        </div>
        <Card>Credit Account essential module</Card>
      </div>
      <Card>Trader order overview</Card>
    </div>
  )
}

export default Trade
