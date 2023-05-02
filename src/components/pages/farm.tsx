import Tab from 'components/Earn/Tab'
import AvailableVaults from 'components/Earn/vault/AvailableVaults'
import FeaturedVaults from 'components/Earn/vault/FeaturedVaults'

export default function Farmpage({ params }: { params: PageParams }) {
  return (
    <>
      <Tab params={params} isFarm />
      <FeaturedVaults />
      <AvailableVaults />
    </>
  )
}
