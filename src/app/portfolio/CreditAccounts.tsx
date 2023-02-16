import { Card } from 'components/Card'
import { Text } from 'components/Text'
import getCreditAccounts from 'libs/getCreditAccounts'

export default async function CreditAccounts() {
  const creditAccounts = await getCreditAccounts()

  return (
    <Card className='flex-1'>
      {creditAccounts.map((creditAccount: string) => (
        <Text key={creditAccount}>Credit account: {creditAccount}</Text>
      ))}
    </Card>
  )
}
