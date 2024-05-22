import { useCallback, useMemo, useState } from 'react'

export default function useFilteredAssets(assets: Asset[]) {
  const [searchString, setSearchString] = useState('')

  const filteredAssets = useMemo(
    () =>
      assets.filter(
        (asset) =>
          asset.symbol.toLocaleLowerCase().includes(searchString.toLowerCase()) ||
          asset.name.toLocaleLowerCase().includes(searchString.toLowerCase()),
      ),
    [searchString, assets],
  )

  const onChangeSearch = useCallback(
    (string: string) => {
      setSearchString(string)
    },
    [setSearchString],
  )

  return { assets: filteredAssets, searchString, onChangeSearch }
}
