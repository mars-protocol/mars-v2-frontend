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
  } = useInfiniteLiquidations(25, ['1229', '4880'])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    // Load more when user scrolls to within 100px of the bottom
    if (scrollHeight - scrollTop - clientHeight < 100 && hasMore && !isLoading) {
      loadMore()
    }
  }, [hasMore, isLoading, loadMore])

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
      <Text size='2xl' className='mb-2'>
        Liquidations Overview
      </Text>
      <div ref={scrollContainerRef} className='max-h-[600px] overflow-y-auto'>
        <Table title='' columns={columns} data={liquidations} initialSorting={[]} />
        {isLoading && (
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
