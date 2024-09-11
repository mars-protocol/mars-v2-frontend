import Card from '../../common/Card'
import Text from '../../common/Text'
import WalletConnectButton from '../../Wallet/WalletConnectButton'

export default function ConnectInfo() {
  return (
    <Card
      className='w-full h-fit bg-white/5'
      title='Portfolio'
      contentClassName='px-4 py-6 flex justify-center flex-wrap'
    >
      <Text size='sm' className='w-full text-center'>
        You need to be connected to view the portfolio page.
      </Text>
      <WalletConnectButton className='mt-4' />
    </Card>
  )
}
