import { Card } from 'components/Card'
import Loading from 'components/Loading'

export default function page() {
  return (
    <div className='flex w-full'>
      <Card className='h-fit w-full justify-center' title='Earn' contentClassName='px-4 py-6'>
        <Loading className='h-4 w-50' />
      </Card>
    </div>
  )
}
