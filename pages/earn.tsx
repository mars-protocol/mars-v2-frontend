import Card from 'components/Card'
import Text from 'components/Text'

const Earn = () => {
  return (
    <div className='flex w-full gap-4'>
      <Card>
        <Text size='lg' uppercase>
          Yield Module
        </Text>
      </Card>
      <div className='w-[450px]'>
        <Card>
          <Text size='lg' uppercase>
            Placeholder
          </Text>
        </Card>
      </div>
    </div>
  )
}

export default Earn
