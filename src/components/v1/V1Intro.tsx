import WalletConnectButton from 'components/Wallet/WalletConnectButton'
import Intro from 'components/common/Intro'
import useStore from 'store'

export default function V1Intro() {
  const address = useStore((state) => state.address)
  return (
    <Intro
      text={
        <>
          <span className='text-white'>Welcome to the Red Bank!</span>
          <br />
          This is the first version (v1) of the Red Bank. It provides simple lending and borrowing,
          without the use of Credit Accounts. Funds are{' '}
          <span className='text-white'>not cross-collateralized</span> and can't be used on v2 as
          collateral.
        </>
      }
      bg='v1'
    >
      {!address && <WalletConnectButton className='mt-4' />}
    </Intro>
  )
}
