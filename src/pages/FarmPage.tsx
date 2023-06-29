import Tab from 'components/Earn/Tab'
import { AvailableVaults, DepositedVaults } from 'components/Earn/vault/Vaults'

export default function FarmPage() {
  return (
    <>
      <Tab isFarm />
      {/* <FeaturedVaults /> */}
      <DepositedVaults />
      <AvailableVaults />
    </>
  )
}
