import { Suspense } from 'react'

import { Card } from 'components/Card'
import Loading from 'components/Loading'
import { Text } from 'components/Text'

async function Content(props: PageProps) {
  const wallet = props.params.wallet
  const currentAccount = props.params.account
  const hasAccount = !isNaN(Number(currentAccount))

  return wallet ? (
    <>
      {hasAccount ? (
        <Text size='sm'>{`Trade with Account ${currentAccount}`}</Text>
      ) : (
        <Text size='sm'>Select an Account to trade</Text>
      )}
    </>
  ) : (
    <Text size='sm'>You need to be connected to trade</Text>
  )
}

function Fallback() {
  return <Loading className='h-4 w-50' />
}

export default function Trade(props: PageProps) {
  return (
    <Card className='h-full w-full' title='Trade Module' contentClassName='px-4 py-6'>
      <Suspense fallback={<Fallback />}>
        {/* @ts-expect-error Server Component */}
        <Content params={props.params} />
      </Suspense>
    </Card>
  )
}
