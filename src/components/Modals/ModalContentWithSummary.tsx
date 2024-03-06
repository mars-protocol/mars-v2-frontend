import classNames from 'classnames'
import React from 'react'

import AccountSummaryInModal from 'components/account/AccountSummary/AccountSummaryInModal'
import Card from 'components/common/Card'
import { CircularProgress } from 'components/common/CircularProgress'
import Modal, { ModalProps } from 'components/Modals/Modal'

interface Props extends ModalProps {
  isHls?: boolean
  account?: Account
  isContentCard?: boolean
  subHeader?: React.ReactNode
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
        className='flex flex-1 p-4 bg-white/5'
        contentClassName='gap-6 flex flex-col justify-between h-full'
      >
        {content}
      </Card>
    )

  return content
}

export default function ModalContentWithSummary(props: Props) {
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
      {props.account && <AccountSummaryInModal account={props.account} isHls={props.isHls} />}
    </Modal>
  )
}
