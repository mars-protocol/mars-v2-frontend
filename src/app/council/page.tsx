import { Card } from 'components/Card'
import { Text } from 'components/Text'

export default async function page() {
  return (
    <div className='flex w-full'>
      <Card className='h-fit w-full justify-center' title='Council' contentClassName='px-4 py-6'>
        <Text size='sm' className='w-full'>
          Council view only
        </Text>
      </Card>
    </div>
  )
}
