import { Suspense, useMemo } from 'react'

import AccountCreateFirst from 'components/Account/AccountCreateFirst'
import { CircularProgress } from 'components/CircularProgress'
import Text from 'components/Text'
import WalletBridges from 'components/Wallet/WalletBridges'
import useAccounts from 'hooks/useAccounts'
import useWalletBalances from 'hooks/useWalletBalances'
import useStore from 'store'
import { byDenom } from 'utils/array'
import { getBaseAsset } from 'utils/assets'
import { hardcodedFee } from 'utils/constants'
import { BN } from 'utils/helpers'

interface WalletProps {
  accounts: Account[]
  balances: Coin[]
}

function FetchLoading() {
  return (
    <div className='min-h-[600px] w-100'>
      <Text size='4xl' className='w-full pb-2 text-center'>
        Fetching Wallet Data
      </Text>
      <Text size='sm' className='h-14 w-full text-center text-white/60'>
        Please wait, while your wallet balances and accounts are beeing analyzed
      </Text>
      <div className='relative flex w-full flex-wrap justify-center pt-4'>
        <CircularProgress size={40} />
      </div>
    </div>
  )
}

function Unmount(props: WalletProps) {
  // Unmount the DOM first before removing the component via focusComponent
  // to avoid 'cannot update a component while rendering a different component' error
  setTimeout(() => {
    useStore.setState({ accounts: props.accounts, balances: props.balances, focusComponent: null })
  }, 50)
  return null
}

function Content() {
  const address = useStore((s) => s.address)
  const { data: accounts } = useAccounts(address)
  const { data: walletBalances, isLoading } = useWalletBalances(address)
  const baseAsset = getBaseAsset()

  const baseBalance = useMemo(
    () => walletBalances.find(byDenom(baseAsset.denom))?.amount ?? '0',
    [walletBalances, baseAsset],
  )

  if (isLoading) return <FetchLoading />
  if (BN(baseBalance).isLessThan(hardcodedFee.amount[0].amount)) return <WalletBridges />
  if (accounts.length === 0) return <AccountCreateFirst />
  return <Unmount accounts={accounts} balances={walletBalances} />
}

export default function WalletFetchBalancesAndAccounts() {
  return (
    <Suspense fallback={<FetchLoading />}>
      <Content />
    </Suspense>
  )
}
