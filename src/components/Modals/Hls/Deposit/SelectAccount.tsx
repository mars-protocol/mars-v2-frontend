import classNames from 'classnames'

import Button from 'components/common/Button'
import { ArrowRight } from 'components/common/Icons'
import Radio from 'components/common/Radio'

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
    <div id='item-2' className='flex flex-col'>
      {props.hlsAccounts.map((account, index) => (
        <div
          key={account.id}
          onClick={() => props.onChangeSelected(account)}
          className={classNames(
            `group/hls relative flex gap-2 items-center p-4 cursor-pointer`,
            index !== props.hlsAccounts.length - 1 && 'border-b border-white/10',
          )}
        >
          <Radio
            active={account.id === props.selectedAccount?.id}
            className={classNames(`group-hover/hls:opacity-100`)}
          />
          {`Hls Account ${account.id}`}
        </div>
      ))}
      <Button
        onClick={handleBtnClick}
        text='Continue'
        rightIcon={<ArrowRight />}
        showProgressIndicator={false}
        className='mx-4 mb-5'
      />
    </div>
  )
}
