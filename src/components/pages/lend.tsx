import Card from 'components/Card'
import Tab from 'components/Earn/Tab'

interface Props {
  children: React.ReactNode
  params: PageParams
}

export default function LendPage(props: Props) {
  return (
    <>
      <Tab params={props.params} />
      <Card title='Lend'>
        <></>
      </Card>
    </>
  )
}
