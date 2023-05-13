import { Suspense } from 'react'
import { useParams } from 'react-router-dom'

import Card from 'components/Card'
import Loading from 'components/Loading'
import Text from 'components/Text'

function Content() {
  const address = useParams().address || ''

  return address ? (
    <Text size='sm'>{`Council page for ${address}`}</Text>
  ) : (
    <Text size='sm'>Council view only</Text>
  )
}

function Fallback() {
  return <Loading className='h-4 w-50' />
}

export default function Overview() {
  return (
    <Card
      className='h-fit w-full justify-center bg-white/5'
      title='Council'
      contentClassName='px-4 py-6'
    >
      <Suspense fallback={<Fallback />}>
        <Content />
      </Suspense>
    </Card>
  )
}
