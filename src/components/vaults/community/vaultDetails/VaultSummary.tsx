import DisplayCurrency from 'components/common/DisplayCurrency'
import HealthBar from 'components/account/Health/HealthBar'
import Table from 'components/common/Table'
import Text from 'components/common/Text'
import VaultStats from 'components/vaults/community/vaultDetails/common/VaultStats'
import useVaultBalances from 'components/vaults/community/vaultDetails/table/useVaultBalances'
import { BN } from 'utils/helpers'
import { BNCoin } from 'types/classes/BNCoin'
import { CardWithTabs } from 'components/common/Card/CardWithTabs'
import { FormattedNumber } from 'components/common/FormattedNumber'
import { vaultBalanceData } from 'components/vaults/dummyData'

export default function VaultSummary() {
  const columns = useVaultBalances()

  const tabs: CardTab[] = [
    {
      title: 'Summary',
      renderContent: () => (
        <VaultStats
          stats={[
            // TODO: fetch from contract
            {
              description: 'Health',
              value: (
                <div className='flex flex-col justify-end gap-2'>
                  <HealthBar health={10} healthFactor={2} className='h-1' />
                  <Text size='2xs' className='text-right text-white/50'>
                    Health Factor: 2
                  </Text>
                </div>
              ),
            },
            {
              description: 'Networth',
              value: <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber('usd', BN(56789))} />,
            },
            {
              description: 'Leverage',
              value: (
                <FormattedNumber
                  amount={4}
                  options={{
                    minDecimals: 0,
                    maxDecimals: 0,
                    suffix: 'x',
                  }}
                />
              ),
            },
            {
              description: 'Total Position Value',
              value: <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber('usd', BN(150000))} />,
            },
            {
              description: 'Debt',
              value: <DisplayCurrency coin={BNCoin.fromDenomAndBigNumber('usd', BN(22100))} />,
            },
            {
              description: 'Net APR',
              value: (
                <FormattedNumber
                  amount={34.2}
                  options={{
                    suffix: '%',
                    minDecimals: 2,
                    maxDecimals: 2,
                  }}
                />
              ),
            },
          ]}
        />
      ),
    },
    {
      title: 'Balances',
      renderContent: () => (
        <Table
          title='Balances'
          hideCard
          columns={columns}
          data={vaultBalanceData}
          initialSorting={[]}
          tableBodyClassName='bg-white/5'
          spacingClassName='p-3'
          type='balances'
        />
      ),
    },
  ]
  return <CardWithTabs tabs={tabs} />
}
