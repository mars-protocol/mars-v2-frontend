import { Card } from 'components/Card'
import { Text } from 'components/Text'
import getVaultsInfo from 'libs/getVaultsInfo'

export default async function VaultsInfo() {
  const vaultsInfo = await getVaultsInfo()

  return (
    <Card className='flex-1'>
      {vaultsInfo.map((vault, index) => (
        <Text key={index}>{vault.vault.address}</Text>
      ))}
    </Card>
  )
}
