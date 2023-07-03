import { useCallback, useMemo, useState } from 'react'

import useAssets from 'hooks/useAssets'

export default function useFilteredAssets() {
  const [searchString, setSearchString] = useState('')

  const allAssets = useAssets()

  const assets = useMemo(
    () =>
      allAssets.filter(
        (asset) =>
          asset.denom.toLocaleLowerCase().includes(searchString.toLowerCase()) ||
          asset.symbol.toLocaleLowerCase().includes(searchString.toLowerCase()) ||
          asset.name.toLocaleLowerCase().includes(searchString.toLowerCase()),
      ),
    [searchString, allAssets],
  )

  const onChangeSearch = useCallback(
    (string: string) => {
      setSearchString(string)
    },
    [setSearchString],
  )

  return { assets, searchString, onChangeSearch }
}
