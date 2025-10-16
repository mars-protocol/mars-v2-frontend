import Text from 'components/common/Text'
import useInfiniteLiquidations from 'hooks/liquidations/useInfiniteLiquidations'
import useLiquidationsColumns from 'components/portfolio/Liquidations/useLiquidationsColumns'
import Table from 'components/common/Table'
import { useCallback, useEffect, useRef } from 'react'

interface Props {
  accountIds: string[]
}

export default function LiquidationsOverview(props: Props) {
  const { accountIds } = props
  const columns = useLiquidationsColumns()
  const {
    data: liquidations,
    isLoading,
    hasMore,
    loadMore,
    isValidating,
  } = useInfiniteLiquidations(25, accountIds)

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(
    (e: Event) => {
      const container = e.currentTarget as HTMLDivElement
      if (!container) return

      const { scrollTop, scrollHeight, clientHeight } = container
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight

      if (distanceFromBottom < 100 && hasMore && !isValidating) {
        loadMore()
      }
    },
    [hasMore, isValidating, loadMore],
  )

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) return

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  if (liquidations.length === 0 && !isLoading) {
    return null
  }

  return (
    <div className='w-full mt-6'>
      <Text size='2xl' className='mb-4'>
        Liquidations Overview
      </Text>
      <div ref={scrollContainerRef} className='max-h-[600px] overflow-y-auto scrollbar-dark'>
        <Table title='' columns={columns} data={liquidations} initialSorting={[]} />
        {isValidating && (
          <div className='flex justify-center py-4'>
            <Text size='sm' className='text-white/60'>
              Loading more...
            </Text>
          </div>
        )}
      </div>
    </div>
  )
}
