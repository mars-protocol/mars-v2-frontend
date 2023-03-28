'use client'

import { useRouter } from 'next/navigation'

import { Button } from 'components/Button'
import { Text } from 'components/Text'
import useParams from 'hooks/useParams'
import useStore from 'store'

export default function AccountList() {
  const router = useRouter()
  const params = useParams()
  const selectedAccount = params.account
  const creditAccounts = useStore((s) => s.creditAccounts)

  return !creditAccounts ? null : (
    <div className='flex w-full flex-wrap border-t border-t-white/10 p-4'>
      <Text size='sm' uppercase={true} className='w-full pb-2'>
        Select Account
      </Text>
      {creditAccounts.map((account) => {
        return selectedAccount === account ? null : (
          <Button
            key={account}
            className='w-full whitespace-nowrap py-2'
            variant='transparent'
            color='quaternary'
            onClick={() => {
              router.push(`/wallets/${params.wallet}/accounts/${account}`)
            }}
            text={`Account ${account}`}
          />
        )
      })}
    </div>
  )
}
