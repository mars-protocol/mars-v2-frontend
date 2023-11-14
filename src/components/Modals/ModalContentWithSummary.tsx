import classNames from 'classnames'
import React from 'react'

import AccountSummary from 'components/Account/AccountSummary'
import Card from 'components/Card'
import { CircularProgress } from 'components/CircularProgress'
import Modal, { ModalProps } from 'components/Modal'
import useStore from 'store'

interface Props extends ModalProps {
  account?: Account
  isContentCard?: boolean
}

function modalContent(content: React.ReactNode, isContentCard?: boolean, account?: Account) {
  if (!account)
    return (
      <div className='flex items-center justify-center w-full h-[380px]'>
        <CircularProgress />
      </div>
    )

  if (isContentCard)
    return (
      <Card
        className={classNames('flex p-4 bg-white/5', 'lg:w-[448px]')}
        contentClassName='gap-6 flex flex-col justify-between h-full min-h-[380px]'
      >
        {content}
      </Card>
    )

  return content
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
      {modalContent(props.content, props.isContentCard, props.account)}
      {props.account && <AccountSummary account={updatedAccount || props.account} />}
    </Modal>
  )
}
