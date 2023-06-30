import { useState } from 'react'

import EscButton from 'components/Button/EscButton'
import Divider from 'components/Divider'
import Overlay from 'components/Overlay'
import SearchBar from 'components/SearchBar'
import Text from 'components/Text'

interface Props {
  show: boolean
  toggleShow: () => void
}

export default function AssetOverlay(props: Props) {
  const [search, setSearch] = useState('')
  function onChangeSearch(value: string) {
    setSearch(value)
  }

  return (
    <Overlay className='h-[800px] w-full' show={props.show} setShow={props.toggleShow}>
      <div className='flex justify-between p-4'>
        <Text>Select asset</Text>
        <EscButton onClick={props.toggleShow} enableKeyPress />
      </div>
      <Divider />
      <div className='p-4'>
        <SearchBar
          value={search}
          onChange={onChangeSearch}
          placeholder='Search for e.g. "ETH" or "Ethereum"'
        />
      </div>
      <Divider />
    </Overlay>
  )
}
