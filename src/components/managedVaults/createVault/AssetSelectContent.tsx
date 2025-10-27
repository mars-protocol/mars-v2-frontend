import AssetsSelect from 'components/Modals/AssetsSelect'
import EscButton from 'components/common/Button/EscButton'
import Overlay from 'components/common/Overlay'
import SearchBar from 'components/common/SearchBar'
import Text from 'components/common/Text'
import { useCallback, useMemo, useState } from 'react'

interface Props {
  showMenu: boolean
  setShowMenu: (show: boolean) => void
  assets: Asset[]
  setSelectedAsset: (asset: Asset) => void
}

export default function AssetSelectContent(props: Props) {
  const { showMenu, setShowMenu, assets, setSelectedAsset } = props
  const [searchString, setSearchString] = useState<string>('')
  const [selectedDenoms, setSelectedDenoms] = useState<string[]>([])

  const handleCloseModal = useCallback(() => {
    setShowMenu(false)
  }, [setShowMenu])

  const handleSelectAsset = useCallback(
    (asset: Asset) => {
      setSelectedAsset(asset)
      setShowMenu(false)
    },
    [setSelectedAsset, setShowMenu],
  )

  const filteredAssets: Asset[] = useMemo(() => {
    return assets.filter(
      (asset) =>
        asset.name.toLowerCase().includes(searchString.toLowerCase()) ||
        asset.symbol.toLowerCase().includes(searchString.toLowerCase()),
    )
  }, [assets, searchString])

  const onChangeSearchString = (value: string) => {
    setSearchString(value)
  }

  const handleChangeSelected = (selected: string[]) => {
    setSelectedDenoms(selected)

    const selectedAsset = assets.find((asset) => selected.includes(asset.denom))
    if (selectedAsset) {
      handleSelectAsset(selectedAsset)
    }
  }

  return (
    <Overlay
      className='top-20 left-0 md:left-[25%] md:top-[10%] flex flex-col w-screen-full h-[calc(100dvh-200px)] md:w-110 md:h-102 overflow-hidden'
      show={showMenu}
      setShow={setShowMenu}
    >
      <div className='flex items-center justify-between px-4 pt-4'>
        <Text>Select asset</Text>
        <EscButton onClick={handleCloseModal} enableKeyPress />
      </div>
      <div className='p-4 border-b border-white/5'>
        <SearchBar
          value={searchString}
          placeholder={'Search for e.g. "ATOM" or "Cosmos"'}
          onChange={(value: string) => {
            onChangeSearchString(value)
          }}
        />
      </div>
      <div className='h-full md:max-h-[446px] overflow-y-scroll scrollbar-hide'>
        <AssetsSelect
          assets={filteredAssets}
          onChangeSelected={handleChangeSelected}
          selectedDenoms={selectedDenoms}
          hideColumns={['value']}
          hideApy
        />
      </div>
    </Overlay>
  )
}
