import classNames from 'classnames'
import React from 'react'

import Button from 'components/Button'
import { ArrowRight } from 'components/Icons'
import Radio from 'components/Radio'

interface Props {
  hlsAccounts: Account[]
  onChangeSelected: (account: Account) => void
  onClickBtn: () => void
  selectedAccount: Account | null
}

export default function CreateAccount(props: Props) {
  async function handleBtnClick() {
    props.onClickBtn()
  }

  return (
    <div className='flex-col flex'>
      {props.hlsAccounts.map((account, index) => (
        <div
          key={account.id}
          onClick={() => props.onChangeSelected(account)}
          className={classNames(
            `group/hls relative flex gap-2 items-center px-4 py-5 cursor-pointer`,
            index !== props.hlsAccounts.length - 1 && 'border-b border-white/10',
          )}
        >
          <Radio
            active={account.id === props.selectedAccount?.id}
            className={classNames(`group-hover/hls:opacity-100`)}
          />
          {`HLS Account ${account.id}`}
        </div>
      ))}
      <Button
        onClick={handleBtnClick}
        text='Continue'
        rightIcon={<ArrowRight />}
        showProgressIndicator={false}
        className='mb-2 mx-4 mb-5'
      />
    </div>
  )
}
