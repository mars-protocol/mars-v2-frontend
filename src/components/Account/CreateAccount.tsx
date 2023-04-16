'use client'

import { Button } from 'components/Button'
import { ArrowRight } from 'components/Icons'
import Text from 'components/Text'

interface Props {
  isCreating: boolean
  createAccount: () => void
}

export default function CreateAccount(props: Props) {
  return (
    <div className='relative z-10 w-full p-4'>
      <Text size='lg' className='mb-2 font-bold'>
        Create a Credit Account
      </Text>
      <Text className='mb-4 text-white/70'>
        Please approve the transaction in your wallet in order to create your first Credit Account.
      </Text>
      <Button
        className='w-full'
        showProgressIndicator={props.isCreating}
        text='Create Account'
        rightIcon={<ArrowRight />}
        onClick={props.createAccount}
      />
    </div>
  )
}
