import { useCallback, useMemo, useState } from 'react'

import SearchBar from 'components/common/SearchBar'
import SingleAssetsSelect from 'components/Modals/AssetsSelect/SingleAssetSelect'

interface Props {
  onChangeDenom: (denoms: string) => void
  assets: Asset[]
  selectedDenom: string
}

export default function VaultAssetsModalContent(props: Props) {
  const { onChangeDenom, assets, selectedDenom } = props
  const [searchString, setSearchString] = useState<string>('')

  const filteredAssets: Asset[] = useMemo(() => {
    return assets.filter(
      (asset) =>
        (asset.name.toLowerCase().includes(searchString.toLowerCase()) ||
          asset.denom.toLowerCase().includes(searchString.toLowerCase()) ||
          asset.symbol.toLowerCase().includes(searchString.toLowerCase())) &&
        !asset.isDeprecated,
    )
  }, [assets, searchString])

  const onChangeSelect = useCallback(
    (denom: string) => {
      if (!denom || denom === '') return
      onChangeDenom(denom)
    },
    [onChangeDenom],
  )

  return (
    <>
      <div className='px-4 py-3 border-b border-white/5'>
        <SearchBar
          value={searchString}
          placeholder={`Search for e.g. "ATOM" or "Cosmos"`}
          onChange={setSearchString}
        />
      </div>
      <div className='h-full md:max-h-[446px] overflow-y-scroll scrollbar-hide'>
        <SingleAssetsSelect
          assets={filteredAssets}
          onChangeSelected={onChangeSelect}
          selectedDenom={selectedDenom}
        />
      </div>
    </>
  )
}
