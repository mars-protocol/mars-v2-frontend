'use client'

import { useRouter } from 'next/navigation'

import { Button } from 'components/Button'
import { Add, ArrowDown, ArrowsLeftRight, ArrowUp, Rubbish } from 'components/Icons'
import { Overlay } from 'components/Overlay/Overlay'
import { OverlayAction } from 'components/Overlay/OverlayAction'
import { Text } from 'components/Text'
import useParams from 'hooks/useParams'
import useStore from 'store'
import { hardcodedFee } from 'utils/contants'

interface Props {
  className?: string
  setShow: (show: boolean) => void
  show: boolean
}

export const AccountManageOverlay = ({ className, setShow, show }: Props) => {
  const router = useRouter()
  const params = useParams()
  const createCreditAccount = useStore((s) => s.createCreditAccount)
  const deleteCreditAccount = useStore((s) => s.deleteCreditAccount)

  async function createAccount() {
    const newAccountId = await createCreditAccount({ fee: hardcodedFee })
    router.push(`/wallets/${params.wallet}/accounts/${newAccountId}`)
  }

  async function deleteAccountHandler() {
    const isSuccess = await deleteCreditAccount({ fee: hardcodedFee, accountId: '1' })
    if (isSuccess) {
      router.push(`/wallets/${params.wallet}/accounts`)
    }
  }

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
              useStore.setState({ fundAccountModal: true })
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
              useStore.setState({ withdrawModal: true })
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
            onClick={createAccount}
            icon={<Add />}
          />
          <OverlayAction
            setShow={setShow}
            text='Close Account'
            onClick={deleteAccountHandler}
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
