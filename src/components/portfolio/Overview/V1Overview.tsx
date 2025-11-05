import Text from 'components/common/Text'
import V1PortfolioCard from 'components/portfolio/Card/V1PortfolioCard'
import useUrlAddress from 'hooks/wallet/useUrlAddress'
import useV1Account from 'hooks/v1/useV1Account'
import useStore from 'store'

export default function V1Overview() {
  const urlAddress = useUrlAddress()
  const walletAddress = useStore((s) => s.address)
  const { data: account } = useV1Account(urlAddress || walletAddress)

  if (!walletAddress && !urlAddress) return null
  if (!account) return null

  // Check if there are any deposits or debts
  const hasBalances = account.lends.length > 0 || account.debts.length > 0

  if (!hasBalances) return null

  return (
    <div className='w-full mt-4'>
      <Text size='2xl' className='mb-2'>
        Red Bank v1
      </Text>
      <div className='grid w-full grid-cols-1 gap-1 md:grid-cols-2 lg:grid-cols-3'>
        <V1PortfolioCard />
      </div>
    </div>
  )
}
