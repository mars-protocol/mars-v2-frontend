import React from 'react'
import Image from 'next/image'

import Container from 'components/Container'

const AssetRow = () => {
  return (
    <div className="flex bg-[#D8DAEA] text-[#585A74] rounded-md p-2">
      <div className="flex flex-1">
        <Image src="/tokens/osmo.svg" alt="token" width={24} height={24} />
        <div className="pl-2">
          <div>DENOM</div>
          <div className="text-xs">Name</div>
        </div>
      </div>
      <div className="flex-1">10.00%</div>
      <div className="flex-1">
        <div>Amount</div>
        <div>Value</div>
      </div>
      <div className="flex-1">
        <div>Amount</div>
        <div>Value</div>
      </div>
      <div className="w-[50px]">ACTION</div>
    </div>
  )
}

const Borrow = () => {
  return (
    <div className="flex gap-4">
      <Container className="flex-1">
        <div className="mb-5">
          <h3 className="font-medium uppercase text-center mb-1">Borrowed</h3>
          <div className="flex bg-[#D8DAEA] text-[#585A74]/50 text-sm rounded-md p-2 mb-2">
            <div className="flex-1">Asset</div>
            <div className="flex-1">Borrow Rate</div>
            <div className="flex-1">Borrowed</div>
            <div className="flex-1">Liquidity Available</div>
            <div className="w-[50px]">Manage</div>
          </div>
          <div className="flex flex-col gap-2">
            {Array.from(Array(3).keys()).map(() => (
              // eslint-disable-next-line react/jsx-key
              <AssetRow />
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-medium uppercase text-center mb-1">Not Borrowed Yet</h3>
          <div className="flex bg-[#D8DAEA] text-[#585A74]/50 text-sm rounded-md p-2 mb-2">
            <div className="flex-1">Asset</div>
            <div className="flex-1">Borrow Rate</div>
            <div className="flex-1">Borrowed</div>
            <div className="flex-1">Liquidity Available</div>
            <div className="w-[50px]">Manage</div>
          </div>
          <div className="flex flex-col gap-2">
            {Array.from(Array(5).keys()).map(() => (
              // eslint-disable-next-line react/jsx-key
              <AssetRow />
            ))}
          </div>
        </div>
      </Container>
    </div>
  )
}

export default Borrow
