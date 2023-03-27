import Accordion from 'components/Accordion'
import Card from 'components/Card'
import { ArrowBullish, Shield } from 'components/Icons'
import { Text } from 'components/Text'

export default function AccountSummary() {
  return (
    <div className='flex min-w-[320px] flex-col'>
      <Card className='mb-4 min-w-fit bg-white/10' contentClassName='flex'>
        <Item>
          <Text size='xs'>$90,000</Text>
        </Item>
        <Item>
          <ArrowBullish />
          <Text size='xs'>4.5x</Text>
        </Item>
        <Item>
          <Shield />
        </Item>
        <Item style={{ border: 'none' }}>
          <Shield />
        </Item>
      </Card>
      <Accordion
        items={[
          { title: 'Subaccount 1 Composition', content: <p>My content</p> },
          { title: 'Risk Score: 60/100', content: <p>My content</p> },
          { title: 'Balances', content: <p>My content</p> },
        ]}
      />
    </div>
  )
}

function Item(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className='flex flex-1 items-center justify-center gap-1 border-r border-r-white/10 px-2 py-2'
      {...props}
    >
      {props.children}
    </div>
  )
}
