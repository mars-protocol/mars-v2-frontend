import AvailableVaults from 'components/Earn/AvailableVaults'
import FeaturedVaults from 'components/Earn/FeaturedVaults'
import Tab from 'components/Earn/Tab'

export default function Farmpage({ params }: { params: PageParams }) {
  return (
    <>
      <Tab params={params} isFarm />
      <FeaturedVaults />
      <AvailableVaults />
    </>
  )
}
