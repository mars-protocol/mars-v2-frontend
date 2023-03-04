import { Card } from 'components/Card'
import { Text } from 'components/Text'

export default function page({ params }: { params: PageParams }) {
  const wallet = params.wallet
  return (
    <div className='flex w-full'>
      <Card className='h-fit w-full justify-center' contentClassName='px-4 py-6' title='Earn'>
        <Text size='sm' className='w-full'>
          {`Earn page of ${wallet}`}
        </Text>
      </Card>
    </div>
  )
}
