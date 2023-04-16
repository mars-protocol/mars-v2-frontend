import { Suspense } from 'react'

import Card from 'components/Card'
import Loading from 'components/Loading'
import Text from 'components/Text'

async function Content(props: PageProps) {
  const address = props.params.address
  const currentAccount = props.params.accountId
  const hasAccount = !isNaN(Number(currentAccount))

  if (!address) return <Text size='sm'>You need to be connected to trade</Text>

  if (!hasAccount) return <Text size='sm'>Select an Account to trade</Text>

  return <Text size='sm'>{`Trade with Account ${currentAccount}`}</Text>
}

function Fallback() {
  return <Loading className='h-4 w-50' />
}

export default function Trade(props: PageProps) {
  return (
    <Card className='h-full w-full bg-white/5' title='Trade Module' contentClassName='px-4 py-6'>
      <Suspense fallback={<Fallback />}>
        {/* @ts-expect-error Server Component */}
        <Content params={props.params} />
      </Suspense>
    </Card>
  )
}
