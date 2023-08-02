import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import AssetBalanceRow from 'components/AssetBalanceRow'
import Button from 'components/Button'
import { ArrowRight } from 'components/Icons'
import Modal from 'components/Modal'
import AccoundDeleteAlertDialog from 'components/Modals/Account/AccountDeleteAlertDialog'
import Text from 'components/Text'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { getAssetByDenom } from 'utils/assets'
import { hardcodedFee } from 'utils/constants'
import { combineBNCoins } from 'utils/parsers'
import { getPage, getRoute } from 'utils/route'

interface Props {
  modal: Account
}

export default function AccountDeleteController() {
  const modal = useStore((s) => s.accountDeleteModal)

  if (!modal) return null

  return <AccountDeleteModal modal={modal} />
}

function AccountDeleteModal(props: Props) {
  const modal = props.modal
  const deleteAccount = useStore((s) => s.deleteAccount)
  const refundAndDeleteAccount = useStore((s) => s.refundAndDeleteAccount)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { address } = useParams()
  const { debts, vaults, id: accountId } = modal || {}
  const [isConfirming, setIsConfirming] = useState(false)

  const closeDeleteAccountModal = useCallback(() => {
    useStore.setState({ accountDeleteModal: null })
  }, [])

  const deleteAccountHandler = useCallback(
    async (hasFunds: boolean) => {
      setIsConfirming(true)
      const options = { fee: hardcodedFee, accountId: modal.id, lends: modal.lends }
      const isSuccess = hasFunds
        ? await refundAndDeleteAccount(options)
        : await deleteAccount(options)
      setIsConfirming(false)
      if (isSuccess) {
        navigate(getRoute(getPage(pathname), address))
        closeDeleteAccountModal()
      }
    },
    [
      modal,
      deleteAccount,
      navigate,
      pathname,
      address,
      closeDeleteAccountModal,
      refundAndDeleteAccount,
    ],
  )

  const depositsAndLends = useMemo(
    () => combineBNCoins([...modal.deposits, ...modal.lends]),
    [modal],
  )

  if (debts.length > 0)
    return (
      <AccoundDeleteAlertDialog
        title='Repay your Debts to delete your account'
        description='You must repay all borrowings before deleting your account.'
        closeHandler={closeDeleteAccountModal}
        positiveButton={{
          text: 'Repay Debts',
          icon: <ArrowRight />,
          onClick: () => {
            navigate(getRoute('borrow', address, accountId))
            closeDeleteAccountModal()
          },
        }}
      />
    )

  if (vaults.length > 0)
    return (
      <AccoundDeleteAlertDialog
        title='Close your positions to delete your account'
        description='You must first close your farming positions before deleting your account.'
        closeHandler={closeDeleteAccountModal}
        positiveButton={{
          text: 'Close Positions',
          icon: <ArrowRight />,
          onClick: () => {
            navigate(getRoute('farm', address, accountId))
            closeDeleteAccountModal()
          },
        }}
      />
    )

  if (depositsAndLends.length === 0)
    return (
      <AccoundDeleteAlertDialog
        title={`Delete Credit Account ${accountId}`}
        description='Deleting your credit account is irreversible.'
        closeHandler={closeDeleteAccountModal}
        positiveButton={{
          text: 'Close Positions',
          icon: <ArrowRight />,
          isAsync: true,
          onClick: () => deleteAccountHandler(false),
        }}
      />
    )

  return (
    <Modal
      onClose={closeDeleteAccountModal}
      header={
        <span className='flex items-center'>
          <Text>{`Delete Account ${modal.id}`}</Text>
        </span>
      }
      modalClassName='max-w-modal-sm'
      headerClassName='gradient-header p-4 border-b-white/5 border-b'
      contentClassName='w-full'
    >
      <div className='w-full border-b border-white/5 p-4 gradient-header'>
        <Text className='text-white/50' size='sm'>
          The following assets within your credit account will be sent to your wallet.
        </Text>
      </div>
      <div className='max-h-100 flex w-full flex-col gap-4 overflow-y-scroll p-4 scrollbar-hide'>
        {depositsAndLends.map((position, index) => {
          const coin = BNCoin.fromDenomAndBigNumber(position.denom, position.amount)
          const asset = getAssetByDenom(position.denom)

          if (!asset) return null
          return <AssetBalanceRow key={index} asset={asset} coin={coin} />
        })}
      </div>
      <div className='w-full px-4 pb-4'>
        <Button
          className='w-full'
          onClick={() => deleteAccountHandler(true)}
          text='Delete Account'
          rightIcon={<ArrowRight />}
          showProgressIndicator={isConfirming}
        />
      </div>
    </Modal>
  )
}
