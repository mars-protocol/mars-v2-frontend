import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import AccountFundFullPage from 'components/account/AccountFund/AccountFundFullPage'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import FullOverlayContent from 'components/common/FullOverlayContent'
import Text from 'components/common/Text'
import WalletSelect from 'components/Wallet/WalletSelect'
import useAccounts from 'hooks/accounts/useAccounts'
import useChainConfig from 'hooks/chain/useChainConfig'
import useToggle from 'hooks/common/useToggle'
import useEnableAutoLendGlobal from 'hooks/localStorage/useEnableAutoLendGlobal'
import useStore from 'store'
import { getPage, getRoute } from 'utils/route'
import IsolatedAccountMintAndFund from './IsolatedAccountMintAndFund'

export default function AccountCreateFirst() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const address = useStore((s) => s.address)
  const chainConfig = useChainConfig()
  const createAccount = useStore((s) => s.createAccount)
  const [isCreating, setIsCreating] = useToggle(false)
  const [isAutoLendEnabled] = useEnableAutoLendGlobal()

  const { data: accounts } = useAccounts('default', address || '')

  useEffect(() => {
    if (!address) useStore.setState({ focusComponent: { component: <WalletSelect /> } })
  }, [address])

  const handleIsolatedAccountClick = useCallback(() => {
    useStore.setState({
      focusComponent: {
        component: <IsolatedAccountMintAndFund />,
      },
    })
  }, [])

  useEffect(() => {
    if (pathname.includes('/isolated')) {
      handleIsolatedAccountClick()
    }
  }, [pathname, handleIsolatedAccountClick])

  const hasExistingAccount = useMemo(() => accounts && accounts.length > 0, [accounts])

  const handleDefaultAccountClick = useCallback(async () => {
    setIsCreating(true)
    const accountId = await createAccount('default', isAutoLendEnabled)
    setIsCreating(false)
    if (accountId) {
      navigate(getRoute(getPage(pathname, chainConfig), searchParams, address, accountId))
      useStore.setState({
        focusComponent: {
          component: <AccountFundFullPage />,
          onClose: () => {
            // TODO: update docs to reflect the current state of v2
            //useStore.setState({ getStartedModal: true })
          },
        },
      })
    }
  }, [
    setIsCreating,
    createAccount,
    navigate,
    pathname,
    searchParams,
    address,
    isAutoLendEnabled,
    chainConfig,
  ])

  return (
    <FullOverlayContent
      title='Create a Credit Account'
      copy="Choose the type of account you'd like to create"
      docs='account'
    >
      <Card className='w-full p-6 bg-white/5'>
        <div className='space-y-6'>
          <div>
            <Text size='lg' className='mb-2 font-semibold'>
              Standard Account
            </Text>
            <Text size='sm' className='mb-4 text-white/70'>
              A flexible account that allows you to deposit and borrow multiple assets.
            </Text>
            <Button
              className='w-full'
              text='Create Standard Account'
              color='tertiary'
              showProgressIndicator={isCreating}
              onClick={handleDefaultAccountClick}
              size='lg'
            />
          </div>

          <div className='pt-6 border-t border-white/10'>
            <Text size='lg' className='mb-2 font-semibold'>
              Isolated Account
            </Text>
            <Text size='sm' className='mb-4 text-white/70'>
              An isolated account that only accepts USDC deposits. Create and fund in one step.
            </Text>
            <Button
              className='w-full'
              text='Create Isolated USDC Account'
              color='secondary'
              onClick={handleIsolatedAccountClick}
              size='lg'
            />
          </div>
        </div>
      </Card>
    </FullOverlayContent>
  )
}
