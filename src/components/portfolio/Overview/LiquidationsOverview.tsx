import Text from 'components/common/Text'
import useInfiniteLiquidations from 'hooks/liquidations/useInfiniteLiquidations'
import useLiquidationsColumns from 'components/portfolio/Liquidations/useLiquidationsColumns'
import Table from 'components/common/Table'
import { useEffect, useRef } from 'react'

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

  const observerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isValidating) {
          loadMore()
        }
      },
      { threshold: 0.1 },
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, isValidating, loadMore])

  if (liquidations.length === 0) {
    return null
  }

  return (
    <div className='w-full mt-6'>
      <Text size='2xl' className='mb-4'>
        Liquidations Overview
      </Text>
      <div className='max-h-[600px] overflow-y-auto scrollbar-dark'>
        <Table title='' columns={columns} data={liquidations} initialSorting={[]} />
        {hasMore && (
          <div ref={observerRef} className='h-20 flex items-center justify-center'>
            {isValidating && (
              <Text size='sm' className='text-white/60'>
                Loading more...
              </Text>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
