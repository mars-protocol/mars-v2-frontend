import Card from 'components/Card'
import Tab from 'components/Earn/Tab'

export default function Farmpage({ params }: { params: PageParams }) {
  return (
    <>
      <Tab params={params} isFarm />
      <Card title='Featured vaults'>
        <></>
      </Card>
    </>
  )
}
