import AvailableVaults from 'components/Earn/vault/AvailableVaults'
import FeaturedVaults from 'components/Earn/vault/FeaturedVaults'
import Tab from 'components/Earn/Tab'

export default function Farmpage() {
  return (
    <>
      <Tab isFarm />
      <FeaturedVaults />
      <AvailableVaults />
    </>
  )
}
