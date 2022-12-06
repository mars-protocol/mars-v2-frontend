import Card from 'components/Card'
import Text from 'components/Text'

const Earn = () => {
  return (
    <div className='flex w-full gap-4'>
      <Card>
        <Text size='lg' uppercase={true}>
          Yield Module
        </Text>
      </Card>
      <div className='w-[450px]'>
        <Card>
          <Text size='lg' uppercase={true}>
            Placeholder
          </Text>
        </Card>
      </div>
    </div>
  )
}

export default Earn
