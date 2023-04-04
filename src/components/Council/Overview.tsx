import { Suspense } from 'react'

import Card from 'components/Card'
import Loading from 'components/Loading'
import { Text } from 'components/Text'

async function Content(props: PageProps) {
  const wallet = props.params.address

  return wallet ? (
    <Text size='sm'>{`Council page for ${wallet}`}</Text>
  ) : (
    <Text size='sm'>Council view only</Text>
  )
}

function Fallback() {
  return <Loading className='h-4 w-50' />
}

export default function Overview(props: PageProps) {
  return (
    <Card
      className='h-fit w-full justify-center bg-white/5'
      title='Council'
      contentClassName='px-4 py-6'
    >
      <Suspense fallback={<Fallback />}>
        {/* @ts-expect-error Server Component */}
        <Content params={props.params} />
      </Suspense>
    </Card>
  )
}
