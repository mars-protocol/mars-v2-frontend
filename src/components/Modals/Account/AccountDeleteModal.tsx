import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import AssetBalanceRow from 'components/Asset/AssetBalanceRow'
import { ArrowRight, ExclamationMarkCircled } from 'components/Icons'
import AccountDeleteAlertDialog from 'components/Modals/Account/AccountDeleteAlertDialog'
import Text from 'components/Text'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { getAssetByDenom } from 'utils/assets'
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
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { address } = useParams()
  const { debts, vaults, id: accountId } = modal || {}

  const closeDeleteAccountModal = useCallback(() => {
    useStore.setState({ accountDeleteModal: null })
  }, [])

  const deleteAccountHandler = useCallback(() => {
    const options = { accountId: modal.id, lends: modal.lends }
    deleteAccount(options)
    navigate(getRoute(getPage(pathname), address))
    closeDeleteAccountModal()
  }, [modal, deleteAccount, navigate, pathname, address, closeDeleteAccountModal])

  const depositsAndLends = useMemo(
    () => combineBNCoins([...modal.deposits, ...modal.lends]),
    [modal],
  )

  if (debts.length > 0)
    return (
      <AccountDeleteAlertDialog
        title='Repay your Debts to delete your account'
        icon={<ExclamationMarkCircled width={18} />}
        content='You must repay all borrowings before deleting your account.'
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
      <AccountDeleteAlertDialog
        title='Close your positions to delete your account'
        content='You must first close your farming positions before deleting your account.'
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
      <AccountDeleteAlertDialog
        title={`Delete Credit Account ${accountId}`}
        content='Deleting your Credit Account is irreversible.'
        closeHandler={closeDeleteAccountModal}
        positiveButton={{
          text: 'Delete Account',
          icon: <ArrowRight />,
          onClick: deleteAccountHandler,
        }}
      />
    )

  return (
    <AccountDeleteAlertDialog
      title={`Delete Credit Account ${accountId}`}
      content={
        <>
          <Text className='mt-2 text-white/50' size='sm'>
            The following assets within your Credit Account will be sent to your wallet.
          </Text>
          <div className='flex flex-col w-full gap-4 py-4 overflow-y-scroll max-h-100 scrollbar-hide'>
            {depositsAndLends.map((position, index) => {
              const coin = BNCoin.fromDenomAndBigNumber(position.denom, position.amount)
              const asset = getAssetByDenom(position.denom)
              if (!asset) return null
              return <AssetBalanceRow key={index} asset={asset} coin={coin} />
            })}
          </div>
        </>
      }
      closeHandler={closeDeleteAccountModal}
      positiveButton={{
        text: 'Delete Account',
        icon: <ArrowRight />,
        onClick: deleteAccountHandler,
      }}
    />
  )
}
