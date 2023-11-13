import classNames from 'classnames'
import React from 'react'

import AccountSummary from 'components/Account/AccountSummary'
import Card from 'components/Card'
import Modal, { ModalProps } from 'components/Modal'
import useStore from 'store'

interface Props extends ModalProps {
  account: Account
  isHls?: boolean
  isContentCard?: boolean
}

export default function ModalContentWithSummary(props: Props) {
  const updatedAccount = useStore((s) => s.updatedAccount)
  return (
    <Modal
      {...props}
      headerClassName={classNames(
        'gradient-header pl-2 pr-2.5 py-3 border-b-white/5 border-b',
        props.headerClassName,
      )}
      contentClassName={classNames('flex items-start flex-1 gap-6 p-6', props.contentClassName)}
    >
      {props.isContentCard ? (
        <Card
          className='flex flex-1 p-4 bg-white/5'
          contentClassName='gap-6 flex flex-col justify-between h-full min-h-[380px]'
        >
          {props.content}
        </Card>
      ) : (
        props.content
      )}
      <AccountSummary account={updatedAccount || props.account} isHls={props.isHls} />
    </Modal>
  )
}
