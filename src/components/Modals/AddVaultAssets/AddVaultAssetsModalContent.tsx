import { useState } from 'react'

import SearchBar from 'components/SearchBar'
import Text from 'components/Text'

export default function AddVaultAssetsModalContent() {
  const [searchString, setSearchString] = useState<string>('')

  function onChangeSearchString(value: string) {
    setSearchString(value)
  }
  return (
    <>
      <div className='border-b border-b-white/5 bg-white/10 px-4 py-3'>
        <SearchBar
          value={searchString}
          placeholder={`Search for e.g. "ETH" or "Ethereum"`}
          onChange={onChangeSearchString}
        />
      </div>
      <div>
        <div className='p-4'>
          <Text>Available Assets</Text>
          <Text size='xs' className='mt-1 text-white/60'>
            Leverage will be set at 50% for both assets by default
          </Text>
        </div>
        <div className='p-4'>
          <Text>Assets not in the liquidity pool</Text>
          <Text size='xs' className='mt-1 text-white/60'>
            These are swapped for an asset within the pool. Toggle Custom Ratio in order to select
            these assets below.
          </Text>
        </div>
      </div>
    </>
  )
}
