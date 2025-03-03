import Card from 'components/common/Card'
import { PerpsModule } from 'components/perps/Module/PerpsModule'
import PerpsBanner from 'components/perps/PerpsBanner'
import { PerpsChart } from 'components/perps/PerpsChart'
import { PerpsPositions } from 'components/perps/PerpsPositions'
import Button from 'components/common/Button'
import Text from 'components/common/Text'
import IsolatedAccountMintAndFund from 'components/account/IsolatedAccountMintAndFund'
import useStore from 'store'
import { PlusCircled } from 'components/common/Icons'

export default function IsolatedPage() {
  const handleCreateIsolatedAccount = () => {
    useStore.setState({
      focusComponent: {
        component: <IsolatedAccountMintAndFund />,
      },
    })
  }

  return (
    <div className='flex flex-wrap w-full gap-4 md:grid md:grid-cols-chart'>
      <div className='w-full'>
        <div className='w-full mb-4'>
          <Card className='p-4 bg-white/5'>
            <div className='flex flex-col md:flex-row md:items-center justify-between'>
              <div>
                <Text size='lg' className='font-semibold mb-2'>
                  Isolated Margin Trading
                </Text>
                <Text size='sm' className='text-white/70'>
                  In order to trade on isolated margin, you should first create an isolated margin
                  account.
                </Text>
              </div>
              <Button
                text='Create Isolated Account'
                color='primary'
                size='md'
                className='mt-3 md:mt-0'
                leftIcon={<PlusCircled />}
                onClick={handleCreateIsolatedAccount}
              />
            </div>
          </Card>
        </div>
        <Card title='Trading Chart'>
          <PerpsChart />,
        </Card>
      </div>
      <div className='w-full row-span-2'>
        <PerpsModule />
      </div>
      <PerpsPositions />
    </div>
  )
}
