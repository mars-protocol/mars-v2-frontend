import { Suspense } from 'react'
import { useParams } from 'react-router-dom'
import Card from 'components/Card'
import Loading from 'components/Loading'
import Text from 'components/Text'

function Content() {
  const params = useParams()
  const address = params.address
  const currentAccount = params.accountId
  const hasAccount = !isNaN(Number(currentAccount))

  if (!address) return <Text size='sm'>You need to be connected to trade</Text>

  if (!hasAccount) return <Text size='sm'>Select an Account to trade</Text>

  return <Text size='sm'>{`Trade with Account ${currentAccount}`}</Text>
}

function Fallback() {
  return <Loading className='h-4 w-50' />
}

export default function Trade() {
  return (
    <Card className='h-full w-full bg-white/5' title='Trade Module' contentClassName='px-4 py-6'>
      <Suspense fallback={<Fallback />}>
        <Content />
      </Suspense>
    </Card>
  )
}
