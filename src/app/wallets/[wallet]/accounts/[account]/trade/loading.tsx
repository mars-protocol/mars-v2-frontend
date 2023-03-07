import { Card } from 'components/Card'
import Loading from 'components/Loading'
import { Text } from 'components/Text'

export default function loading() {
  return (
    <div className='mb-4 flex w-full flex-wrap gap-4'>
      <Card className='h-full flex-grow' title='Trading View' contentClassName='px-4 py-6'>
        <Text size='sm' className='w-full'>
          Chart view
        </Text>
      </Card>
      <Card className='h-full w-1/3' title='Trade Module' contentClassName='px-4 py-6'>
        <Loading className='h-4 w-50' />
      </Card>
      <Card className='h-full w-full' title='Order Book' contentClassName='px-4 py-6'>
        <Loading className='h-4 w-50' />
      </Card>
    </div>
  )
}
