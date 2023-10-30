import React from 'react'

import Button from 'components/Button'
import { ArrowRight } from 'components/Icons'

interface Props {
  hlsAccounts: AccountIdAndKind[]
  onClickBtn: () => void
}

export default function ChooseAccount(props: Props) {
  return (
    <div className='p-4'>
      <Button onClick={props.onClickBtn} text='Continue' rightIcon={<ArrowRight />} />
    </div>
  )
}
