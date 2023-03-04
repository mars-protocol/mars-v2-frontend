import { Card } from 'components/Card'
import { Text } from 'components/Text'

export default function page({ params }: { params: PageParams }) {
  const wallet = params.wallet

  return (
    <div className='flex w-full'>
      <Card className='h-fit w-full' title='Earn' contentClassName='px-4 py-6'>
        <Text size='base'>{`Earn page for ${wallet}`}</Text>
      </Card>
    </div>
  )
}
