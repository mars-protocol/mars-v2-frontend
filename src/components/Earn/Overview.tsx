import { Suspense } from 'react'

import Card from 'components/Card'
import Loading from 'components/Loading'
import { Text } from 'components/Text'

async function Content(props: PageProps) {
  const wallet = props.params.address

  return wallet ? (
    <Text size='sm'>{`Earn page for ${wallet}`}</Text>
  ) : (
    <Text size='sm' className='w-full text-center'>
      You need to be connected to use the earn page
    </Text>
  )
}

function Fallback() {
  return <Loading className='h-4 w-50' />
}

export default function Overview(props: PageProps) {
  return (
    <Card
      className='h-fit w-full justify-center bg-white/5'
      title='Earn'
      contentClassName='px-4 py-6'
    >
      <Suspense fallback={<Fallback />}>
        {/* @ts-expect-error Server Component */}
        <Content params={props.params} />
      </Suspense>
    </Card>
  )
}
