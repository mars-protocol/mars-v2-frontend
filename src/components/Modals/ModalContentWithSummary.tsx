import classNames from 'classnames'
import React from 'react'

import AccountSummaryInModal from 'components/account/AccountSummary/AccountSummaryInModal'
import Card from 'components/common/Card'
import { CircularProgress } from 'components/common/CircularProgress'
import Modal from 'components/Modals/Modal'

interface Props extends ModalProps {
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
        className='flex flex-1 w-full p-4 bg-white/5 max-w-screen-full min-w-[200px]'
        contentClassName='gap-6 flex flex-col justify-between h-full min-h-[380px]'
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
        'bg-surface-dark border-b-white/5 border-b',
        props.headerClassName,
      )}
      contentClassName={classNames(
        'flex items-start flex-1 p-2 gap-1 flex-wrap',
        'md:p-3 md:gap-2',
        'lg:flex-nowrap lg:p-3',
        props.contentClassName,
      )}
    >
      {modalContent(props.content, props.isContentCard, props.account)}
      {props.account && <AccountSummaryInModal account={props.account} />}
    </Modal>
  )
}
