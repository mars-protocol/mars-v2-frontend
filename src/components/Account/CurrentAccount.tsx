'use client'

import { useRouter } from 'next/navigation'

import { Button } from 'components/Button'
import { ArrowDownLine, ArrowsLeftRight, ArrowUpLine, PlusCircled, Rubbish } from 'components/Icons'
import { Text } from 'components/Text'
import useParams from 'hooks/useParams'
import useStore from 'store'
import { hardcodedFee } from 'utils/contants'

export default function CurrentAccount() {
  const router = useRouter()
  const params = useParams()
  const selectedAccount = params.account

  const createCreditAccount = useStore((s) => s.createCreditAccount)
  const deleteCreditAccount = useStore((s) => s.deleteCreditAccount)

  const accountSelected = !!selectedAccount && !isNaN(Number(selectedAccount))

  async function createAccountHandler() {
    const accountId = await createCreditAccount({ fee: hardcodedFee })
    if (!accountId) return
    router.push(`/wallets/${params.wallet}/accounts/${accountId}`)
  }

  async function deleteAccountHandler() {
    if (!accountSelected) return
    const isSuccess = await deleteCreditAccount({ fee: hardcodedFee, accountId: selectedAccount })
    if (isSuccess) {
      router.push(`/wallets/${params.wallet}/accounts`)
    }
  }

  return (
    <>
      <Text size='sm' uppercase={true} className='w-full px-4 pt-4'>
        Manage Account {selectedAccount}
      </Text>
      <div className='flex w-full justify-between p-4'>
        <Button
          className='flex w-[115px] items-center justify-center pl-0 pr-2'
          text='Fund'
          leftIcon={<ArrowUpLine />}
          onClick={() => {
            useStore.setState({ fundAccountModal: true })
          }}
        />
        <Button
          className='flex w-[115px] items-center justify-center pl-0 pr-2'
          color='secondary'
          leftIcon={<ArrowDownLine />}
          text='Withdraw'
          onClick={() => {
            useStore.setState({ withdrawModal: true })
          }}
        />
      </div>
      <div className='flex w-full flex-wrap border-t border-t-white/10 p-4'>
        <Button
          className='w-full whitespace-nowrap py-2'
          variant='transparent'
          color='quaternary'
          text='Create New Account'
          onClick={() => {
            createAccountHandler()
          }}
          leftIcon={<PlusCircled />}
        />
        <Button
          className='w-full whitespace-nowrap py-2'
          variant='transparent'
          color='quaternary'
          text='Close Account'
          onClick={() => {
            deleteAccountHandler()
          }}
          leftIcon={<Rubbish />}
        />
        <Button
          className='w-full whitespace-nowrap py-2'
          variant='transparent'
          color='quaternary'
          text='Transfer Balance'
          onClick={() => {}}
          leftIcon={<ArrowsLeftRight />}
        />
      </div>
    </>
  )
}
