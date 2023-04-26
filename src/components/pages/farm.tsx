import AvailableVaults from 'components/earn/vault/AvailableVaults'
import FeaturedVaults from 'components/earn//vault/FeaturedVaults'
import Tab from 'components/earn/Tab'

export default function Farmpage({ params }: { params: PageParams }) {
  return (
    <>
      <Tab params={params} isFarm />
      <FeaturedVaults />
      <AvailableVaults />
    </>
  )
}
