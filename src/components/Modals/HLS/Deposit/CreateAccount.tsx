import React, { useState } from 'react'
import { mutate } from 'swr'

import Button from 'components/common/Button'
import DocsLink from 'components/common/DocsLink'
import { ArrowRight } from 'components/common/Icons'
import Text from 'components/common/Text'
import useStore from 'store'

export default function CreateAccount() {
  const createAccount = useStore((s) => s.createAccount)

  const [isTxPending, setIsTxPending] = useState(false)

  async function handleBtnClick() {
    setIsTxPending(true)
    const response = await createAccount('high_levered_strategy')

    if (response === null) {
      setIsTxPending(false)
      return
    }
    await mutate('accounts/high_levered_strategy')
  }

  return (
    <div id='item-2' className='p-4 flex-col flex'>
      <Text size='sm' className='text-white/50 mb-4 mt-2'>
        Depositing into a HLS strategy mandates the creation of a HLS credit account.
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
