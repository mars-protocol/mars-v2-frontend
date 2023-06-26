import AvailableVaults from 'components/Earn/vault/AvailableVaults'
import DepositedVaults from 'components/Earn/vault/DepositedVaults'
import FeaturedVaults from 'components/Earn/vault/FeaturedVaults'
import Tab from 'components/Earn/Tab'

export default function FarmPage() {
  return (
    <>
      <Tab isFarm />
      <FeaturedVaults />
      <DepositedVaults />
      <AvailableVaults />
    </>
  )
}
