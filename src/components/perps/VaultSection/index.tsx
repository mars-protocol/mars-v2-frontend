import { Suspense } from 'react'
import Table from 'components/common/Table'
import Card from 'components/common/Card'
import Text from 'components/common/Text'
import usePerpsVaultColumns from 'components/perps/VaultSection/Columns/usePerpsVaultColumns'
import usePerpsVaultData from 'components/perps/VaultSection/usePerpsVaultData'
import Skeleton from 'components/perps/VaultSection/Skeleton'
import ConditionalWrapper from 'hocs/ConditionalWrapper'

interface Props {
  accountId: string
  hideCard?: boolean
}

function Content({ accountId, hideCard }: Props) {
  const perpsVaultData = usePerpsVaultData(accountId)
  const columns = usePerpsVaultColumns()

  if (!perpsVaultData.length) {
    return (
      <ConditionalWrapper
        condition={!hideCard}
        wrapper={(children) => (
          <Card className='w-full' title='Perps Vault'>
            {children}
          </Card>
        )}
      >
        <div className='w-full p-4'>
          <Text size='sm' className='text-center'>
            This account has no perps vault positions.
          </Text>
        </div>
      </ConditionalWrapper>
    )
  }

  return (
    <div className='flex flex-wrap w-full gap-4'>
      <Text size='2xl'>Perp Vault</Text>
      <Card className='w-full bg-white/5'>
        <Table
          title='Perp Vault'
          columns={columns}
          data={perpsVaultData as PerpsVaultRow[]}
          tableBodyClassName='text-white/60'
          initialSorting={[]}
          spacingClassName='p-2'
          hideCard
          type='perps'
        />
      </Card>
    </div>
  )
}

export default function PerpsVaultSection(props: Props) {
  return (
    <Suspense fallback={<Skeleton />}>
      <Content {...props} />
    </Suspense>
  )
}
