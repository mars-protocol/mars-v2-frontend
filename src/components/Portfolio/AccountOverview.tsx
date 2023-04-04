import { Suspense } from 'react'
import classNames from 'classnames'

import Card from 'components/Card'
import Loading from 'components/Loading'
import { Text } from 'components/Text'
import { getAccounts } from 'utils/api'

async function Content(props: PageProps) {
  const wallet = props.params.address
  const currentAccount = props.params.accountId
  const hasAccount = !isNaN(Number(currentAccount))
  const account = await getAccounts(wallet)

  return wallet ? (
    <div className={classNames('grid grid-cols-1 gap-4', 'md:grid-cols-2', 'lg:grid-cols-3')}>
      {account.map((account: Account, index: number) => (
        <Card
          className='h-fit w-full bg-white/5'
          title={`Account ${account}`}
          key={index}
          contentClassName='px-4 py-6'
        >
          {hasAccount && currentAccount === account.id ? (
            <Text size='sm'>Current Account</Text>
          ) : (
            <Text size='sm'>Account details</Text>
          )}
        </Card>
      ))}
    </div>
  ) : (
    <Card
      className='h-fit w-full justify-center bg-white/5'
      title='Portfolio'
      contentClassName='px-4 py-6'
    >
      <Text size='sm' className='w-full text-center'>
        You need to be connected to view the porfolio page
      </Text>
    </Card>
  )
}

function Fallback() {
  const cardCount = 3
  return (
    <div className={classNames('grid grid-cols-1 gap-4', 'md:grid-cols-2', 'lg:grid-cols-3')}>
      {Array.from({ length: cardCount }, (_, i) => (
        <Card
          key={i}
          className='h-fit w-full bg-white/5'
          title={
            <>
              Account <Loading className='ml-2 h-4 w-8' />
            </>
          }
          contentClassName='px-4 py-6'
        >
          <Loading className='h-4 w-50' />
        </Card>
      ))}
    </div>
  )
}

export default function AccountOverview(props: PageProps) {
  return (
    <Suspense fallback={<Fallback />}>
      {/* @ts-expect-error Server Component */}
      <Content params={props.params} />
    </Suspense>
  )
}
