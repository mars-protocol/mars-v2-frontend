import { Card } from 'components/Card'
import { Text } from 'components/Text'
import { getCreditAccounts } from 'utils/api'

export default async function page({ params }: { params: PageParams }) {
  const wallet = params.wallet
  const creditAccounts = await getCreditAccounts(wallet)

  return (
    <div className='flex w-full'>
      <div className='mb-4 flex flex-grow gap-4'>
        {creditAccounts.map((account: string, index: number) => (
          <Card
            className='h-fit w-full'
            title={`Account ${account}`}
            key={index}
            contentClassName='px-4 py-6'
          >
            <Text size='sm'>Account details</Text>
          </Card>
        ))}
      </div>
    </div>
  )
}
