import Text from 'components/common/Text'
import useLiquidations from 'hooks/liquidations/useLiquidations'
import useLiquidationsColumns from 'components/portfolio/Liquidations/useLiquidationsColumns'
import Table from 'components/common/Table'

interface Props {
  accountIds: string[]
}

export default function LiquidationsOverview(props: Props) {
  const { accountIds } = props
  const columns = useLiquidationsColumns()
  const { data: liquidations, isLoading: isLiquidationsDataLoading } = useLiquidations(
    1,
    25,
    accountIds,
  )

  if (liquidations?.data.length === 0) {
    return null
  }

  return (
    <div className='w-full mt-6'>
      <Text size='2xl' className='mb-2'>
        Liquidations Overview
      </Text>
      <Table title='' columns={columns} data={liquidations?.data ?? []} initialSorting={[]} />
    </div>
  )
}
