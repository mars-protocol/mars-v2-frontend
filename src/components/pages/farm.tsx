import Card from 'components/Card'
import Tab from 'components/Earn/Tab'

interface Props {
  children: React.ReactNode
  params: PageParams
}

export default function FarmPage(props: Props) {
  return (
    <>
      <Tab params={props.params} isFarm />
      <Card title='Featured vaults'>
        <></>
      </Card>
    </>
  )
}
