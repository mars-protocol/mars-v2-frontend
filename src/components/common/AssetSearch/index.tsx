import { useMemo, useState } from 'react'
import SearchBar from 'components/common/SearchBar/index'
import AssetDropdown from 'components/common/AssetDropdown'
import useSearchableAssets from 'hooks/assets/useSearchableAssets'

interface Props {
  onSelectAsset: (asset: Asset) => void
  label?: string
  className?: string
}

export default function AssetSearch({ onSelectAsset, label = 'Search Assets', className }: Props) {
  const [searchValue, setSearchValue] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const searchableAssets = useSearchableAssets()

  const filteredAssets = useMemo(() => {
    if (!searchableAssets) return []

    const searchTrimmed = searchValue.trim()
    const searchLower = searchTrimmed.toLowerCase()

    if (searchTrimmed) {
      return searchableAssets
        .filter(
          (asset) =>
            asset.name.toLowerCase().includes(searchLower) ||
            asset.symbol.toLowerCase().includes(searchLower) ||
            asset.denom.toLowerCase().includes(searchLower),
        )
        .slice(0, 50)
    }

    return searchableAssets.slice(0, 10)
  }, [searchableAssets, searchValue])

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    setIsDropdownOpen(value.length > 0)
  }

  const handleSelectAsset = (asset: Asset) => {
    onSelectAsset(asset)
    setSearchValue('')
    setIsDropdownOpen(false)
  }

  const handleEnter = () => {
    // Only select first asset if there's a search value and filtered results
    if (searchValue.trim() && filteredAssets.length > 0) {
      handleSelectAsset(filteredAssets[0])
    }
  }

  return (
    <SearchBar
      value={searchValue}
      onChange={handleSearchChange}
      onEnter={handleEnter}
      label={label}
      className={className}
    >
      <AssetDropdown
        searchValue={searchValue}
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        onSelectAsset={handleSelectAsset}
      />
    </SearchBar>
  )
}
