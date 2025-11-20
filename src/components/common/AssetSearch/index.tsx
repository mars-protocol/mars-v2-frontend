import classNames from 'classnames'
import { useState } from 'react'
import SearchBar from 'components/common/SearchBar/index'
import AssetDropdown from 'components/common/AssetDropdown'

interface Props {
  onSelectAsset: (asset: Asset) => void
  label?: string
  className?: string
}

export default function AssetSearch({ onSelectAsset, label = 'Search Assets', className }: Props) {
  const [searchValue, setSearchValue] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    setIsDropdownOpen(value.length > 0)
  }

  const handleSelectAsset = (asset: Asset) => {
    onSelectAsset(asset)
    setSearchValue('')
    setIsDropdownOpen(false)
  }

  return (
    <SearchBar
      value={searchValue}
      onChange={handleSearchChange}
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
