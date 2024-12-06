import { useState } from 'react'

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
    const response = await createAccount('high_levered_strategy', false)

    if (response === null) {
      setIsTxPending(false)
      return
    }
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
