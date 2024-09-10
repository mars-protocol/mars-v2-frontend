import { useCallback } from 'react'

import Text from 'components/common/Text'
import SearchBar from 'components/common/SearchBar'
import { ChevronDown, Logo } from 'components/common/Icons'
import EscButton from 'components/common/Button/EscButton'
import Overlay from 'components/common/Overlay'

interface Props {
  showMenu: boolean
  setShowMenu: (show: boolean) => void
  // TODO: update TS
  assets: any[]
  setSelectedAsset: (asset: any) => void
}

export default function AssetSelect(props: Props) {
  const { showMenu, setShowMenu, assets, setSelectedAsset } = props

  const handleCloseModal = useCallback(() => {
    console.log('Select Asset Modal Closed')
    setShowMenu(false)
  }, [setShowMenu])

  const handleSelectAsset = (asset: any) => {
    setSelectedAsset(asset)
    setShowMenu(false)
  }

  return (
    <Overlay
      className='top-20 left-0 md:left-[25%] md:top-[10%] flex flex-col w-screen-full h-[calc(100dvh-200px)] md:w-110 md:h-102 overflow-hidden'
      show={showMenu}
      setShow={setShowMenu}
    >
      <div className='flex justify-between p-4 bg-white/10'>
        <Text>Select asset</Text>
        <EscButton onClick={handleCloseModal} enableKeyPress />
      </div>
      <div className='px-4 py-3 border-b border-white/5 bg-white/10'>
        {/* TODO: make the search work */}
        <SearchBar
          value={''}
          placeholder={`Search for e.g. "ATOM" or "Cosmos"`}
          onChange={() => {}}
        />
      </div>
      {assets.map((asset, index) => (
        <div
          className='w-full px-4 py-3 flex justify-between items-center outline-none border-b border-white/10 hover:cursor-pointer'
          key={index}
        >
          <div className='w-full flex items-center gap-2' onClick={() => handleSelectAsset(asset)}>
            {/* TODO: temp asset picture */}
            <Logo className='h-6 w-6' />
            <Text size='base'>{asset.label}</Text>
          </div>
          <ChevronDown className='h-4 w-4 -rotate-90' />
        </div>
      ))}
    </Overlay>
  )
}
