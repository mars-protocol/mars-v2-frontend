import Card from 'components/Card'
import FormattedNumber from 'components/FormattedNumber'
import Text from 'components/Text'

const mockedAccounts = [
  {
    id: 1,
    label: 'Account 1',
    networth: 100000,
    totalPositionValue: 150000,
    debt: 50000,
    profit: 25000,
    leverage: 3,
    maxLeverage: 5,
  },
  {
    id: 2,
    label: 'Account 2',
    networth: 33000,
    totalPositionValue: 11000,
    debt: 20000,
    profit: -11366,
    leverage: 2,
    maxLeverage: 10,
  },
  {
    id: 3,
    label: 'Account 3',
    networth: 0,
    totalPositionValue: 12938129,
    debt: 9999999999,
    profit: -99999999,
    leverage: 3,
    maxLeverage: 5,
  },
  {
    id: 4,
    label: 'Account 4',
    networth: 33653.22,
    totalPositionValue: 100000,
    debt: 50001.9,
    profit: 25000,
    leverage: 3,
    maxLeverage: 5,
  },
]

const Portfolio = () => {
  return (
    <div className='flex w-full items-start gap-4'>
      <Card className='flex-1'>
        <Text size='lg' uppercase={true}>
          Portfolio Module
        </Text>
      </Card>
      <div className='grid grid-cols-2 gap-4'>
        {mockedAccounts.map((account) => (
          <Card key={account.id}>
            <Text size='lg' uppercase={true} className='mb-4 text-center'>
              {account.label}
            </Text>
            <div className='grid grid-cols-3 gap-4'>
              <div>
                <Text>
                  <FormattedNumber amount={account.networth} animate prefix='$' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Net worth
                </Text>
              </div>
              <div>
                <Text>
                  <FormattedNumber amount={account.totalPositionValue} animate prefix='$' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Total Position Value
                </Text>
              </div>
              <div>
                <Text>
                  <FormattedNumber amount={account.debt} animate prefix='$' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Debt
                </Text>
              </div>
              <div>
                <Text className={account.profit > 0 ? 'text-green-400' : 'text-red-500'}>
                  <FormattedNumber
                    amount={account.debt}
                    animate
                    prefix={account.profit > 0 ? '+$' : '$'}
                  />
                </Text>
                <Text size='sm' className='text-white/40'>
                  P&L
                </Text>
              </div>
              <div>
                <Text>
                  <FormattedNumber amount={account.leverage} minDecimals={0} suffix='x' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Current Leverage
                </Text>
              </div>
              <div>
                <Text>
                  <FormattedNumber amount={account.maxLeverage} minDecimals={0} suffix='x' />
                </Text>
                <Text size='sm' className='text-white/40'>
                  Max Leverage
                </Text>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Portfolio
