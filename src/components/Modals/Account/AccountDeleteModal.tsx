import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import AssetImage from 'components/AssetImage'
import Button from 'components/Button'
import DisplayCurrency from 'components/DisplayCurrency'
import { FormattedNumber } from 'components/FormattedNumber'
import { ArrowRight, Enter, InfoCircle } from 'components/Icons'
import Modal from 'components/Modal'
import Text from 'components/Text'
import useAlertDialog from 'hooks/useAlertDialog'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { getAssetByDenom } from 'utils/assets'
import { hardcodedFee } from 'utils/constants'
import { demagnify } from 'utils/formatters'
import { combineBNCoins } from 'utils/parsers'
import { getPage, getRoute } from 'utils/route'

export default function AccountDeleteModal() {
  const modal = useStore((s) => s.accountDeleteModal)
  const { open: showAlertDialog } = useAlertDialog()
  const deleteAccount = useStore((s) => s.deleteAccount)
  const refundAndDeleteAccount = useStore((s) => s.refundAndDeleteAccount)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { address } = useParams()
  const { debts, deposits, lends, vaults, id: accountId } = modal || {}
  const [isConfirming, setIsConfirming] = useState(false)

  const closeDeleteAccountModal = useCallback(() => {
    useStore.setState({ accountDeleteModal: null })
  }, [])

  const deleteAccountHandler = useCallback(
    async (hasFunds: boolean) => {
      if (!modal) return
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
    [accountId, showAlertDialog, deleteAccountHandler, closeDeleteAccountModal],
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
    [showAlertDialog, closeDeleteAccountModal, navigate, address, accountId],
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
  }, [
    debts,
    vaults,
    deposits,
    lends,
    showAlertDialog,
    deleteAccountHandler,
    deleteEmptyAccount,
    showOpenPositionAlert,
  ])

  if (!modal) return null

  const depositsAndLends = combineBNCoins([...modal.deposits, ...modal.lends])

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
        <Text className='text-white/50' size='xs'>
          The following assets within your credit account will be sent to your wallet.
        </Text>
      </div>
      <div className='max-h-100 flex w-full flex-col gap-4 overflow-y-scroll p-4 scrollbar-hide'>
        {depositsAndLends.map((position, index) => {
          const coin = BNCoin.fromDenomAndBigNumber(position.denom, position.amount)
          const asset = getAssetByDenom(position.denom)

          if (!asset) return null
          return (
            <div className='flex w-full items-center gap-4' key={index}>
              <AssetImage asset={asset} size={32} />
              <div className='flex flex-1 flex-wrap'>
                <Text className='w-full'>{asset.symbol}</Text>
                <Text size='sm' className='w-full text-white/50'>
                  {asset.name}
                </Text>
              </div>
              <div className='flex flex-wrap'>
                <DisplayCurrency coin={coin} className='w-full text-right' />
                <FormattedNumber
                  amount={demagnify(coin.amount, asset)}
                  className='w-full text-right text-sm text-white/50'
                  options={{ suffix: ` ${asset.symbol}` }}
                  animate
                />
              </div>
            </div>
          )
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
