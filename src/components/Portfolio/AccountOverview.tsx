import classNames from 'classnames'
import { Suspense } from 'react'
import { useParams } from 'react-router-dom'

import { AcccountBalancesTable } from 'components/Account/AccountBalancesTable'
import AccountComposition from 'components/Account/AccountComposition'
import Card from 'components/Card'
import Loading from 'components/Loading'
import Text from 'components/Text'

import useSWR from 'swr'
import getWalletAccounts from 'api/wallets/getWalletAccounts'

function Content() {
  const address = useParams().address || ''
  const { data: account } = useSWR(address, getWalletAccounts, { suspense: true })

  if (!address) {
    return (
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

  return (
    <div
      className={classNames('grid w-full grid-cols-1 gap-4', 'md:grid-cols-2', 'lg:grid-cols-3')}
    >
      {account.map((account: Account, index: number) => (
        <Card className='h-fit w-full bg-white/5' title={`Account ${account.id}`} key={index}>
          <AccountComposition account={account} />
          <Text className='mt-3 w-full bg-white/10 px-4 py-2 text-white/40'>Balances</Text>
          <AcccountBalancesTable data={account} />
        </Card>
      ))}
    </div>
  )
}

function Fallback() {
  const cardCount = 3
  return (
    <div
      className={classNames('grid w-full grid-cols-1 gap-4', 'md:grid-cols-2', 'lg:grid-cols-3')}
    >
      {Array.from({ length: cardCount }, (_, i) => (
        <Card key={i} className='h-fit w-full bg-white/5' title='Account' contentClassName='py-6'>
          <div className='p-4'>
            <Loading className='h-4 w-50' />
          </div>
          <Text className='mt-3 w-full bg-white/10 px-4 py-2 text-white/40'>Balances</Text>
          <Loading className='h-4 w-full' />
        </Card>
      ))}
    </div>
  )
}

export default function AccountOverview() {
  return (
    <Suspense fallback={<Fallback />}>
      <Content />
    </Suspense>
  )
}
