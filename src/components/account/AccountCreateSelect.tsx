import { useCallback, useEffect, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import AccountCreateFirst from 'components/account/AccountCreateFirst'
import Button from 'components/common/Button'
import Card from 'components/common/Card'
import FullOverlayContent from 'components/common/FullOverlayContent'
import Text from 'components/common/Text'
import WalletSelect from 'components/Wallet/WalletSelect'
import useStore from 'store'
import IsolatedAccountMintAndFund from './IsolatedAccountMintAndFund'

export default function AccountCreateSelect() {
  const { pathname } = useLocation()
  const address = useStore((s) => s.address)

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

  const handleDefaultAccountClick = useCallback(() => {
    useStore.setState({
      focusComponent: {
        component: <AccountCreateFirst />,
      },
    })
  }, [])

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
              A flexible account that allows you to deposit and borrow multiple assets. Use for all
              features including lending, borrowing, and trading.
            </Text>
            <Button
              className='w-full'
              text='Create Standard Account'
              color='tertiary'
              onClick={handleDefaultAccountClick}
              size='lg'
            />
          </div>

          <div className='pt-6 border-t border-white/10'>
            <Text size='lg' className='mb-2 font-semibold'>
              Isolated Account
            </Text>
            <Text size='sm' className='mb-4 text-white/70'>
              A specialized account that only accepts USDC deposits and can only be used for
              isolated perpetual positions. Create and fund in one step.
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
