import Accordion from 'components/Accordion'
import AccountHealth from 'components/Account/AccountHealth'
import Card from 'components/Card'
import { ArrowChartLineUp } from 'components/Icons'
import Text from 'components/Text'
import useParams from 'utils/route'

export default function AccountSummary() {
  const params = useParams()

  return (
    <div className='flex min-w-[320px] flex-col'>
      <Card className='mb-4 min-w-fit bg-white/10' contentClassName='flex'>
        <Item>
          <Text size='sm'>$90,000</Text>
        </Item>
        <Item>
          <span className='flex items-center w-4 h-4'>
            <ArrowChartLineUp />
          </span>
          <Text size='sm'>4.5x</Text>
        </Item>
        <Item>
          <AccountHealth health={80} />
        </Item>
      </Card>
      <Accordion
        items={[
          { title: `Subaccount ${params.accountId} Composition`, content: <p>My content</p> },
          { title: 'Balances', content: <p>My content</p> },
        ]}
      />
    </div>
  )
}

function Item(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className='flex items-center justify-center flex-1 gap-1 px-2 py-2 border-r border-r-white/10'
      {...props}
    >
      {props.children}
    </div>
  )
}
