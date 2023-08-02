import { useCallback, useEffect } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import { ArrowRight, Enter, InfoCircle } from 'components/Icons'
import useAlertDialog from 'hooks/useAlertDialog'
import useStore from 'store'
import { hardcodedFee } from 'utils/constants'
import { getPage, getRoute } from 'utils/route'

export default function AccountDeleteModal() {
  const modal = useStore((s) => s.accountDeleteModal)
  const { open: showAlertDialog, close: closeAlertDialog } = useAlertDialog()
  const deleteAccount = useStore((s) => s.deleteAccount)
  const refundAndDeleteAccount = useStore((s) => s.refundAndDeleteAccount)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { address } = useParams()
  const { debts, deposits, lends, vaults, id: accountId } = modal || {}

  const deleteAccountHandler = useCallback(
    async (hasFunds: boolean) => {
      if (!modal) return
      const options = { fee: hardcodedFee, accountId: modal.id }
      const isSuccess = hasFunds
        ? await refundAndDeleteAccount(options)
        : await deleteAccount(options)

      if (isSuccess) {
        navigate(getRoute(getPage(pathname), address))
        closeDeleteAccountModal()
      }
    },
    [modal, deleteAccount, navigate, pathname, address],
  )

  const closeDeleteAccountModal = useCallback(() => {
    useStore.setState({ accountDeleteModal: null })
  }, [])

  const deleteEmptyAccount = useCallback(
    () =>
      showAlertDialog({
        icon: (
          <div className='flex h-full w-full p-3'>
            <InfoCircle />
          </div>
        ),
        title: `Delete Credit Account ${accountId}`,
        description: 'Deleting your credit account is irreversible.',
        positiveButton: {
          text: 'Yes',
          icon: <Enter />,
          isAsync: true,
          onClick: () => deleteAccountHandler(false),
        },
        negativeButton: {
          onClick: closeDeleteAccountModal,
        },
      }),
    [accountId, showAlertDialog, deleteAccountHandler],
  )
  const showOpenPositionAlert = useCallback(
    (type: 'debts' | 'vaults') => {
      const hasDebts = type === 'debts'
      return showAlertDialog({
        icon: (
          <div className='flex h-full w-full p-3'>
            <InfoCircle />
          </div>
        ),
        title: hasDebts
          ? 'Repay your Debts to delete your account'
          : 'Close your positions to delete your account',
        description: hasDebts
          ? 'You must first repay all borrowings before deleting your account.'
          : 'You must first close your farming positions before deleting your account.',
        negativeButton: {
          text: 'Close',
          icon: <Enter />,
          onClick: closeDeleteAccountModal,
        },
        positiveButton: hasDebts
          ? {
              text: 'Repay Debts',
              icon: <ArrowRight />,
              onClick: () => {
                console.log('CLOSE')
                navigate(getRoute('borrow', address, accountId))
                closeDeleteAccountModal()
              },
            }
          : {
              text: 'Close Positions',
              icon: <ArrowRight />,
              onClick: () => {
                navigate(getRoute('farm', address, accountId))
                closeDeleteAccountModal()
              },
            },
      })
    },
    [showAlertDialog],
  )

  useEffect(() => {
    if (!debts || !vaults || !deposits || !lends) return

    if (debts.length > 0) {
      showOpenPositionAlert('debts')
      return
    }
    if (vaults.length > 0) {
      showOpenPositionAlert('vaults')
      return
    }

    if (deposits.length > 0 || lends.length > 0) return

    deleteEmptyAccount()
  }, [modal, showAlertDialog, deleteAccountHandler])

  if (!modal) return null

  // TODO: implment modal for accounts with funds
  return <div>MODAL</div>
}
