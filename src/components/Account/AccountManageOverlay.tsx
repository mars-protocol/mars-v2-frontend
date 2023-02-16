'use client'

import { useEffect } from 'react'

import { Add, ArrowDown, ArrowsLeftRight, ArrowUp, Rubbish } from 'components/Icons'
import { Button } from 'components/Button'
import { Text } from 'components/Text'
import { Overlay } from 'components/Overlay/Overlay'
import { OverlayAction } from 'components/Overlay/OverlayAction'
import { useCreateCreditAccount } from 'hooks/mutations/useCreateCreditAccount'
import { useDeleteCreditAccount } from 'hooks/mutations/useDeleteCreditAccount'
import { useAccountDetailsStore } from 'stores/useAccountDetailsStore'
import { useModalStore } from 'stores/useModalStore'

interface Props {
  className?: string
  setShow: (show: boolean) => void
  show: boolean
}

export const AccountManageOverlay = ({ className, setShow, show }: Props) => {
  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)

  const { mutate: createCreditAccount, isLoading: isLoadingCreate } = useCreateCreditAccount()
  const { mutate: deleteCreditAccount, isLoading: isLoadingDelete } = useDeleteCreditAccount(
    selectedAccount || '',
  )

  useEffect(() => {
    useModalStore.setState({ createAccountModal: isLoadingCreate })
  }, [isLoadingCreate])

  useEffect(() => {
    useModalStore.setState({ deleteAccountModal: isLoadingDelete })
  }, [isLoadingDelete])

  return (
    <Overlay className={className} show={show} setShow={setShow}>
      <div className='flex w-[274px] flex-wrap'>
        <Text size='sm' uppercase={true} className='w-full px-4 pt-4 text-center text-accent-dark'>
          Manage
        </Text>
        <div className='flex w-full justify-between border-b border-b-black/10 p-4'>
          <Button
            className='flex w-[115px] items-center justify-center pl-0 pr-2'
            onClick={() => {
              useModalStore.setState({ fundAccountModal: true })
              setShow(false)
            }}
          >
            <span className='mr-1 w-3'>
              <ArrowUp />
            </span>
            Fund
          </Button>
          <Button
            className='flex w-[115px] items-center justify-center pl-0 pr-2'
            color='secondary'
            onClick={() => {
              useModalStore.setState({ withdrawModal: true })
              setShow(false)
            }}
          >
            <span className='mr-1 w-3'>
              <ArrowDown />
            </span>
            Withdraw
          </Button>
        </div>
        <div className='flex w-full flex-wrap p-4'>
          <OverlayAction
            setShow={setShow}
            text='Create New Account'
            onClick={createCreditAccount}
            icon={<Add />}
          />
          <OverlayAction
            setShow={setShow}
            text='Close Account'
            onClick={deleteCreditAccount}
            icon={<Rubbish />}
          />
          <OverlayAction
            setShow={setShow}
            text='Transfer Balance'
            onClick={() => alert('TODO')}
            icon={<ArrowsLeftRight />}
          />
        </div>
      </div>
    </Overlay>
  )
}
