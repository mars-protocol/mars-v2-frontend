import Banner from 'components/common/Banner'
import Text from 'components/common/Text'
import usePerpsVault from 'hooks/perps/usePerpsVault'
import { USDC } from 'components/common/Icons'
import { PerpsModule } from 'components/perps/Module/PerpsModule'
import { PerpsChart } from 'components/perps/PerpsChart'
import { PerpsPositions } from 'components/perps/PerpsPositions'
import { Deposit } from 'components/earn/farm/common/Table/Columns/Deposit'

export default function PerpsPage() {
  const { data: vault } = usePerpsVault()

  return (
    <div className='md:grid flex flex-wrap w-full md:grid-cols-[auto_346px] gap-4'>
      <div>
        <Banner
          icon={<USDC />}
          title={
            <>
              Counterparty vault: earn up to <span className='text-purple'>5% APY.</span>
            </>
          }
          description='Earn perps trading fees by depositing USDC into the counterparty vault, with deposits subject to a 7-day lockup.'
          button={
            <Deposit vault={vault as PerpsVault} isLoading={false} isPerps buttonColor='primary' />
          }
        />
        <PerpsChart />
      </div>
      <div className='row-span-2'>
        <PerpsModule />
      </div>
      <PerpsPositions />
    </div>
  )
}
