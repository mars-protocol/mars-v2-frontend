import React from 'react'
import Image from 'next/image'

import Container from 'components/Container'

const AssetRow = () => {
  return (
    <div className="flex rounded-md bg-[#D8DAEA] p-2 text-[#585A74]">
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
          <h3 className="mb-1 text-center font-medium uppercase">Borrowed</h3>
          <div className="mb-2 flex rounded-md bg-[#D8DAEA] p-2 text-sm text-[#585A74]/50">
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
          <h3 className="mb-1 text-center font-medium uppercase">Not Borrowed Yet</h3>
          <div className="mb-2 flex rounded-md bg-[#D8DAEA] p-2 text-sm text-[#585A74]/50">
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
