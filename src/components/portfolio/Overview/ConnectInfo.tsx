import Card from 'components/common/Card'
import Text from 'components/common/Text'

export default function ConnectInfo() {
  return (
    <Card
      className='w-full h-fit bg-white/5'
      title='Portfolio'
      contentClassName='px-4 py-6 flex justify-center flex-wrap'
    >
      <Text size='sm' className='w-full text-center'>
        This protocol has been retired. The app is now view-only.
      </Text>
    </Card>
  )
}
