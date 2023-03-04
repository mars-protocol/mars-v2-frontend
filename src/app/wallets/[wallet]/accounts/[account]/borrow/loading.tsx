import { Card } from 'components/Card'
import Loading from 'components/Loading'

export default function laoding() {
  return (
    <div className='flex w-full'>
      <Card className='h-fit w-full justify-center' title='Borrow' contentClassName='px-4 py-6'>
        <Loading className='w-50 h-4' />
      </Card>
    </div>
  )
}
