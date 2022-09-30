import React from 'react'
import Container from 'components/Container'

const Trade = () => {
  return (
    <div>
      <div className="mb-4 flex gap-4">
        <Container className="flex-1">Graph/Tradingview Module</Container>
        <div className="flex flex-col gap-4">
          <Container>Buy/Sell module</Container>
          <Container>Orderbook module (optional)</Container>
        </div>
        <Container>Credit Account essential module</Container>
      </div>
      <Container>Trader order overview</Container>
    </div>
  )
}

export default Trade
