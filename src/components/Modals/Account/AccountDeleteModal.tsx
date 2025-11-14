import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import AccountAlertDialog from 'components/Modals/Account/AccountAlertDialog'
import { ArrowRight, ExclamationMarkCircled } from 'components/common/Icons'
import Text from 'components/common/Text'
import AssetBalanceRow from 'components/common/assets/AssetBalanceRow'
import useDepositEnabledAssets from 'hooks/assets/useDepositEnabledAssets'
import useChainConfig from 'hooks/chain/useChainConfig'
import useStore from 'store'
import { BNCoin } from 'types/classes/BNCoin'
import { byDenom } from 'utils/array'
import { combineBNCoins } from 'utils/parsers'
import { getPage, getRoute } from 'utils/route'
import getAccountIds from 'api/wallets/getAccountIds'

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
  const { address: urlAddress } = useParams()
  const navigate = useNavigate()
  const chainConfig = useChainConfig()
  const { pathname } = useLocation()
  const { address } = useParams()
  const { debts, vaults, id: accountId } = modal || {}
  const [searchParams] = useSearchParams()
  const assets = useDepositEnabledAssets()
  const closeDeleteAccountModal = useCallback(() => {
    useStore.setState({ accountDeleteModal: null })
  }, [])

  const deleteAccountHandler = useCallback(async () => {
    useStore.setState({ accountDeleteModal: null })
    const options = { accountId: modal.id, lends: modal.lends }
    const path = getPage(pathname, chainConfig)
    const isDeleted = await deleteAccount(options)

    if (isDeleted) {
      const remainingAccounts = await getAccountIds(chainConfig, urlAddress)

      if (remainingAccounts.length > 0) {
        const firstAccountId = remainingAccounts[0].id
        if (path.includes('portfolio')) {
          navigate(getRoute('portfolio', searchParams, urlAddress, firstAccountId))
        } else {
          navigate(getRoute(path, searchParams, address, firstAccountId))
        }
      } else {
        if (path.includes('portfolio')) {
          navigate(getRoute('portfolio', searchParams, urlAddress))
        } else {
          navigate(getRoute(path, searchParams, address))
        }
      }
    }
    closeDeleteAccountModal()
  }, [
    modal.id,
    modal.lends,
    pathname,
    chainConfig,
    deleteAccount,
    closeDeleteAccountModal,
    navigate,
    searchParams,
    urlAddress,
    address,
  ])

  const depositsAndLends = useMemo(
    () => combineBNCoins([...modal.deposits, ...modal.lends]),
    [modal],
  )

  const hasPerpsVaultPositions = useMemo(() => {
    return (
      modal?.perpsVault?.active ||
      (modal?.perpsVault?.unlocking && modal?.perpsVault?.unlocking?.length > 0) ||
      modal?.perpsVault?.unlocked
    )
  }, [modal?.perpsVault])

  if (debts.length > 0)
    return (
      <AccountAlertDialog
        title='Repay your Debts to delete your account'
        icon={<ExclamationMarkCircled />}
        content='You must repay all borrowings before deleting your account.'
        closeHandler={closeDeleteAccountModal}
        positiveButton={{
          text: 'Repay Debts',
          icon: <ArrowRight />,
          onClick: () => {
            navigate(getRoute('borrow', searchParams, address, accountId))
            closeDeleteAccountModal()
          },
        }}
      />
    )

  if (vaults.length > 0)
    return (
      <AccountAlertDialog
        title='Close your positions to delete your account'
        content='You must first close your farming positions before deleting your account.'
        closeHandler={closeDeleteAccountModal}
        positiveButton={{
          text: 'Close Positions',
          icon: <ArrowRight />,
          onClick: () => {
            navigate(getRoute('farm', searchParams, address, accountId))
            closeDeleteAccountModal()
          },
        }}
      />
    )

  if (hasPerpsVaultPositions) {
    return (
      <AccountAlertDialog
        title='Withdraw from Counterparty Vault to delete your account'
        content='You must first withdraw your funds from the counterparty vault before deleting your account.'
        closeHandler={closeDeleteAccountModal}
        positiveButton={{
          text: 'Go to Perps Vault',
          icon: <ArrowRight />,
          onClick: () => {
            navigate(getRoute('perps-vault', searchParams, address, accountId))
            closeDeleteAccountModal()
          },
        }}
      />
    )
  }

  if (modal.stakedAstroLps.length > 0) {
    return (
      <AccountAlertDialog
        title='Withdraw Staked Astro LP positions to delete your account'
        content='You must first withdraw your staked Astro LP positions before deleting your account.'
        closeHandler={closeDeleteAccountModal}
        positiveButton={{
          text: 'Go to Farm',
          icon: <ArrowRight />,
          onClick: () => {
            navigate(getRoute('farm', searchParams, address, accountId))
            closeDeleteAccountModal()
          },
        }}
      />
    )
  }

  if (depositsAndLends.length === 0)
    return (
      <AccountAlertDialog
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
    <AccountAlertDialog
      title={`Delete Credit Account ${accountId}`}
      content={
        <>
          <Text className='mt-2 text-white/50' size='sm'>
            The following assets within your Credit Account will be sent to your wallet.
          </Text>
          <div className='flex flex-col w-full gap-4 py-4 overflow-y-scroll max-h-100 scrollbar-hide'>
            {depositsAndLends.map((position, index) => {
              const coin = BNCoin.fromDenomAndBigNumber(position.denom, position.amount)
              const asset = assets.find(byDenom(position.denom))
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
