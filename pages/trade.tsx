import React from 'react'

import Container from 'components/Container'
import TradeActionModule from 'components/Trade/TradeActionModule'

const Trade = () => {
  return (
    <div>
      <div className='mb-4 flex gap-4'>
        <Container className='grid flex-1 place-items-center'>Graph/Tradingview Module</Container>
        <div className='flex flex-col gap-4'>
          <Container className='min-w-[350px] !p-2 text-sm'>
            <TradeActionModule />
          </Container>
          <Container>Orderbook module (optional)</Container>
        </div>
      </div>
      <Container>Trader order overview</Container>
    </div>
  )
}

export default Trade
