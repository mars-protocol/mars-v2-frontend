import { Gauge } from 'components/Gauge'
import { Heart } from 'components/Icons'
import Text from 'components/Text'
import useCurrentAccount from 'hooks/useCurrentAccount'
import useStore from 'store'

interface Props {
  account: Account
}

export default function AccountDetailsController() {
  const account = useCurrentAccount()
  const address = useStore((s) => s.address)

  if (!account || !address) return null

  return <AccountDetails account={account} />
}

function AccountDetails(props: Props) {
  return (
    <div
      data-testid='account-details'
      className='w-16 border rounded-base border-white/20 bg-white/5 backdrop-blur-sticky'
    >
      <div className='flex flex-wrap justify-center w-full py-4'>
        <Gauge tooltip='Health Factor' percentage={20} icon={<Heart />} />
        <Text size='2xs' className='mb-0.5 mt-1 w-full text-center text-white/50'>
          Health
        </Text>
        <Text size='xs' className='w-full text-center'>
          89%
        </Text>
      </div>
      <div className='w-full py-4 border border-x-0 border-white/20'>
        <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
          Leverage
        </Text>
        <Text size='xs' className='w-full text-center'>
          4.5x
        </Text>
      </div>
      <div className='w-full py-4'>
        <Text size='2xs' className='mb-0.5 w-full text-center text-white/50'>
          Balance
        </Text>
        <Text size='xs' className='w-full text-center'>
          $300M
        </Text>
      </div>
    </div>
  )
}
