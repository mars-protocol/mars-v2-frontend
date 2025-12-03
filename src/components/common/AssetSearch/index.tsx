import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
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

  useEffect(() => {
    setHighlightedIndex(0)
  }, [filteredAssets.length, searchValue])

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    setIsDropdownOpen(value.length > 0)
    setHighlightedIndex(0)
  }

  const handleSelectAsset = (asset: Asset) => {
    onSelectAsset(asset)
    setSearchValue('')
    setIsDropdownOpen(false)
    setHighlightedIndex(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (filteredAssets.length > 0) {
        if (!isDropdownOpen) {
          setIsDropdownOpen(true)
        }
        setHighlightedIndex((prev) => (prev + 1) % filteredAssets.length)
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (filteredAssets.length > 0) {
        if (!isDropdownOpen) {
          setIsDropdownOpen(true)
        }
        setHighlightedIndex((prev) => (prev - 1 + filteredAssets.length) % filteredAssets.length)
      }
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (isDropdownOpen && filteredAssets.length > 0 && filteredAssets[highlightedIndex]) {
        handleSelectAsset(filteredAssets[highlightedIndex])
      } else if (filteredAssets.length > 0) {
        // If dropdown is closed but we have results, open and select first
        setIsDropdownOpen(true)
        if (filteredAssets[highlightedIndex] || filteredAssets[0]) {
          handleSelectAsset(filteredAssets[highlightedIndex] || filteredAssets[0])
        }
      }
    } else if (e.key === 'Escape') {
      if (isDropdownOpen) {
        e.preventDefault()
        setIsDropdownOpen(false)
        setHighlightedIndex(0)
      }
    }
  }

  return (
    <SearchBar
      ref={inputRef}
      value={searchValue}
      onChange={handleSearchChange}
      onKeyDown={handleKeyDown}
      label={label}
      className={className}
    >
      <AssetDropdown
        searchValue={searchValue}
        isOpen={isDropdownOpen}
        onClose={() => setIsDropdownOpen(false)}
        onSelectAsset={handleSelectAsset}
        highlightedIndex={highlightedIndex}
        filteredAssets={filteredAssets}
      />
    </SearchBar>
  )
}
