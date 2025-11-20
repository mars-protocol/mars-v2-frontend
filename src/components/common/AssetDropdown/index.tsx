import classNames from 'classnames'
import { useEffect, useMemo, useRef } from 'react'
import AssetImage from 'components/common/assets/AssetImage'
import AssetSymbol from 'components/common/assets/AssetSymbol'
import Text from 'components/common/Text'
import useAssets from 'hooks/assets/useAssets'

interface Props {
  searchValue: string
  isOpen: boolean
  onClose: () => void
  onSelectAsset: (asset: Asset) => void
  className?: string
  maxResults?: number
}

export default function AssetDropdown({
  searchValue,
  isOpen,
  onClose,
  onSelectAsset,
  className,
  maxResults = 50,
}: Props) {
  const { data: assets } = useAssets()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const filteredAssets = useMemo(() => {
    if (!assets) return []

    const searchTrimmed = searchValue.trim()
    if (!searchTrimmed) {
      return assets.filter((asset) => !asset.isDeprecated).slice(0, maxResults)
    }

    const searchLower = searchTrimmed.toLowerCase()
    const filtered = assets.filter(
      (asset) =>
        !asset.isDeprecated &&
        (asset.name.toLowerCase().includes(searchLower) ||
          asset.symbol.toLowerCase().includes(searchLower) ||
          asset.denom.toLowerCase().includes(searchLower)),
    )

    return filtered.slice(0, maxResults)
  }, [assets, searchValue, maxResults])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen, onClose])

  if (!isOpen || filteredAssets.length === 0) return null

  return (
    <div
      ref={dropdownRef}
      className={classNames(
        'absolute top-full left-0 mt-1 w-80 max-h-96 overflow-y-auto',
        'bg-surface-dark border border-white/20 rounded-sm shadow-lg z-50',
        'scrollbar-hide',
        className,
      )}
    >
      <ul className='w-full'>
        {filteredAssets.map((asset) => (
          <li
            key={`${asset.denom}-${asset.chainName || ''}`}
            className='border-b border-white/10 last:border-b-0 hover:bg-black/10 cursor-pointer transition-colors'
          >
            <button
              onClick={() => {
                onSelectAsset(asset)
                onClose()
              }}
              className='flex items-center gap-3 w-full p-3 text-left'
            >
              <AssetImage asset={asset} className='w-6 h-6 shrink-0' />
              <div className='flex flex-col flex-1 min-w-0'>
                <div className='flex items-center gap-1'>
                  <Text size='sm' className='truncate'>
                    {asset.name}
                  </Text>
                  <AssetSymbol symbol={asset.symbol} />
                </div>
                {asset.chainName && (
                  <Text size='xs' className='text-white/50 mt-0.5'>
                    {asset.chainName}
                  </Text>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
      {filteredAssets.length >= maxResults && (
        <div className='p-2 border-t border-white/10'>
          <Text size='xs' className='text-white/50 text-center'>
            Showing first {maxResults} results
          </Text>
        </div>
      )}
    </div>
  )
}
