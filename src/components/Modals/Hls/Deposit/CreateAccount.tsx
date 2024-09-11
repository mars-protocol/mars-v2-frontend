import { useState } from 'react'
import { mutate } from 'swr'

import useStore from '../../../../store'
import Button from '../../../common/Button'
import DocsLink from '../../../common/DocsLink'
import { ArrowRight } from '../../../common/Icons'
import Text from '../../../common/Text'

export default function CreateAccount() {
  const createAccount = useStore((s) => s.createAccount)

  const [isTxPending, setIsTxPending] = useState(false)

  async function handleBtnClick() {
    setIsTxPending(true)
    const response = await createAccount('high_levered_strategy', false)

    if (response === null) {
      setIsTxPending(false)
      return
    }
    await mutate('accounts/high_levered_strategy')
  }

  return (
    <div id='item-2' className='flex flex-col p-4'>
      <Text size='sm' className='mt-2 mb-4 text-white/50'>
        Depositing into a Hls strategy mandates the creation of a Hls credit account.
      </Text>
      <Button
        onClick={handleBtnClick}
        text='Approve Transaction'
        rightIcon={<ArrowRight />}
        showProgressIndicator={isTxPending}
        disabled={isTxPending}
        className='mb-2'
      />
      <DocsLink className='text-xs' type='account' />
    </div>
  )
}
