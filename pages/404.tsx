import Button from 'components/Button'
import Card from 'components/Card'
import Text from 'components/Text'

const Error404 = () => {
  return (
    <div className='flex w-full'>
      <Card>
        <Text size='2xl' uppercase className='text-center'>
          Oooops...
        </Text>
        <Text className='my-4 text-center'>Looks like this page doesn&apos;t exist!</Text>
        <div className='flex justify-center'>
          <Button onClick={() => (location.href = '/trade')} text='Home'></Button>
        </div>
      </Card>
    </div>
  )
}

export default Error404
