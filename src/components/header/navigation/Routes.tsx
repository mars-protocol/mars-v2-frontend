import { Navigate, Outlet, Route, Routes as RoutesWrapper } from 'react-router-dom'

import useChainConfig from 'hooks/chain/useChainConfig'
import Layout from 'pages/_layout'
import BorrowPage from 'pages/BorrowPage'
import ExecuteMessagePage from 'pages/ExecuteMessagePage'
import FarmPage from 'pages/FarmPage'
import HLSFarmPage from 'pages/HLSFarmPage'
import HLSStakingPage from 'pages/HLSStakingPage'
import LendPage from 'pages/LendPage'
import PerpsPage from 'pages/PerpsPage'
import PortfolioAccountPage from 'pages/PortfolioAccountPage'
import PortfolioPage from 'pages/PortfolioPage'
import TradePage from 'pages/TradePage'
import V1Page from 'pages/V1Page'
import VaultsOfficialPage from 'pages/VaultsOfficialPage'
import VaultsCommunityPage from 'pages/VaultsCommunityPage'
import CreateVault from 'components/vaults/community/createVault/index'
import MintVaultAccount from 'components/vaults/community/createVault/MintVaultAccount'
import VaultDetails from 'components/vaults/community/vaultDetails/index'

export default function Routes() {
  const chainConfig = useChainConfig()
  return (
    <RoutesWrapper>
      <Route
        element={
          <Layout>
            <Outlet />
          </Layout>
        }
      >
        <Route path='/' element={<TradePage />} />
        <Route path='/trade' element={<TradePage />} />
        <Route path='/trade-advanced' element={<TradePage />} />
        <Route path='/farm' element={<FarmPage />} />
        <Route path='/lend' element={<LendPage />} />
        <Route path='/borrow' element={<BorrowPage />} />
        <Route path='/portfolio' element={<PortfolioPage />} />
        <Route path='/v1' element={<V1Page />} />

        {chainConfig.perps && <Route path='/perps' element={<PerpsPage />} />}
        {chainConfig.hls && <Route path='/hls-staking' element={<HLSStakingPage />} />}
        {chainConfig.hls && <Route path='/hls-farm' element={<HLSFarmPage />} />}

        <Route path='/vaults' element={<VaultsOfficialPage />}>
          <Route path='create' element={<CreateVault />} />
        </Route>
        <Route path='/vaults-community' element={<VaultsCommunityPage />} />

        <Route path='/wallets/:address'>
          <Route path='' element={<TradePage />} />
          <Route path='execute' element={<ExecuteMessagePage />} />
          <Route path='trade' element={<TradePage />} />
          <Route path='trade-advanced' element={<TradePage />} />
          <Route path='farm' element={<FarmPage />} />
          <Route path='lend' element={<LendPage />} />
          <Route path='borrow' element={<BorrowPage />} />
          <Route path='portfolio' element={<PortfolioPage />} />
          <Route path='v1' element={<V1Page />} />

          {chainConfig.perps && <Route path='perps' element={<PerpsPage />} />}
          {chainConfig.hls && <Route path='hls-staking' element={<HLSStakingPage />} />}
          {chainConfig.hls && <Route path='hls-farm' element={<HLSFarmPage />} />}

          <Route path='vaults-community' element={<VaultsCommunityPage />} />
          <Route path='vaults' element={<VaultsOfficialPage />}>
            <Route path='create' element={<CreateVault />} />
            <Route path=':vaultAddress/mint-account' element={<MintVaultAccount />} />
            <Route path=':vaultAddress/details' element={<VaultDetails />} />
          </Route>

          <Route path='portfolio/:accountId'>
            <Route path='' element={<PortfolioAccountPage />} />
          </Route>
        </Route>

        <Route path='*' element={<Navigate to='/' />} />
      </Route>
    </RoutesWrapper>
  )
}
