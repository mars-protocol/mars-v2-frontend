import Button from 'components/Button'
import PlusIcon from 'components/Icons/add.svg'
import ArrowDown from 'components/Icons/arrow-down.svg'
import ArrowUp from 'components/Icons/arrow-up.svg'
import ArrowsLeftRight from 'components/Icons/arrows-left-right.svg'
import DeleteIcon from 'components/Icons/rubbish.svg'
import Overlay from 'components/Overlay/Overlay'
import OverlayAction from 'components/Overlay/OverlayLink'
import Text from 'components/Text'
import useCreateCreditAccount from 'hooks/mutations/useCreateCreditAccount'
import useDeleteCreditAccount from 'hooks/mutations/useDeleteCreditAccount'
import { useEffect } from 'react'
import useAccountDetailsStore from 'stores/useAccountDetailsStore'
import useModalStore from 'stores/useModalStore'

interface Props {
  className?: string
  setShow: (show: boolean) => void
  show: boolean
}

const AccountManageOverlay = ({ className, setShow, show }: Props) => {
  const setFundAccountModal = useModalStore((s) => s.actions.setFundAccountModal)
  const setWithdrawModal = useModalStore((s) => s.actions.setWithdrawModal)
  const setDeleteAccountModal = useModalStore((s) => s.actions.setDeleteAccountModal)
  const setCreateAccountModal = useModalStore((s) => s.actions.setCreateAccountModal)
  const selectedAccount = useAccountDetailsStore((s) => s.selectedAccount)

  const { mutate: createCreditAccount, isLoading: isLoadingCreate } = useCreateCreditAccount()
  const { mutate: deleteCreditAccount, isLoading: isLoadingDelete } = useDeleteCreditAccount(
    selectedAccount || '',
  )

  useEffect(() => {
    setCreateAccountModal(isLoadingCreate)
  }, [isLoadingCreate])

  useEffect(() => {
    setDeleteAccountModal(isLoadingDelete)
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
              setFundAccountModal(true)
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
              setWithdrawModal(true)
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
            icon={<PlusIcon />}
          />
          <OverlayAction
            setShow={setShow}
            text='Close Account'
            onClick={deleteCreditAccount}
            icon={<DeleteIcon />}
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

export default AccountManageOverlay
