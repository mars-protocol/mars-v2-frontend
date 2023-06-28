import Tab from 'components/Earn/Tab'
import Vaults from 'components/Earn/vault/Vaults'

export default function FarmPage() {
  return (
    <>
      <Tab isFarm />
      {/* <FeaturedVaults /> */}
      <Vaults type='deposited' />
      <Vaults type='available' />
    </>
  )
}
