import Card from 'components/common/Card'
import TableSkeleton from 'components/common/Table/TableSkeleton'
import Text from 'components/common/Text'

interface Props {
  children?: React.ReactNode
}

export default function Skeleton({ children }: Props) {
  return (
    <div className='flex flex-wrap w-full gap-4'>
      <Text size='2xl'>Perp Vault</Text>
      <Card className='w-full bg-white/5'>
        {children ? children : <TableSkeleton labels={['Asset', 'Value', 'Status']} rowCount={3} />}
      </Card>
    </div>
  )
}
