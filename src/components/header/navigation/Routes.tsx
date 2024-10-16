import { Navigate, Outlet, Route, Routes as RoutesWrapper } from 'react-router-dom'

import useChainConfig from 'hooks/chain/useChainConfig'
import Layout from 'pages/_layout'
import BorrowPage from 'pages/BorrowPage'
import ExecuteMessagePage from 'pages/ExecuteMessagePage'
import FarmPage from 'pages/FarmPage'
import HlsFarmPage from 'pages/HlsFarmPage'
import HlsStakingPage from 'pages/HlsStakingPage'
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
import PerpsVaultPage from 'pages/PerpsVaultPage'

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
        <Route path='/trade' element={<TradePage />} />
        <Route path='/trade-advanced' element={<TradePage />} />
        {chainConfig.perps && <Route path='/perps' element={<PerpsPage />} />}
        <Route path='/farm' element={<FarmPage />} />
        <Route path='/lend' element={<LendPage />} />
        {chainConfig.perps && <Route path='/perps-vault' element={<PerpsVaultPage />} />}
        <Route path='/borrow' element={<BorrowPage />} />
        <Route path='/portfolio' element={<PortfolioPage />} />
        <Route path='/v1' element={<V1Page />} />
        {chainConfig.hls && <Route path='/hls-staking' element={<HlsStakingPage />} />}
        {chainConfig.hls && <Route path='/hls-farm' element={<HlsFarmPage />} />}
        <Route path='/vaults' element={<VaultsOfficialPage />}>
          <Route path='create' element={<CreateVault />} />
        </Route>
        <Route path='/vaults-community' element={<VaultsCommunityPage />} />
        <Route path='/vaults/:vaultAddress'>
          <Route path='mint-account' element={<MintVaultAccount />} />
          {/* TODO */}
          {/* <Route path='delete' element={<CreateVault />} /> */}
        </Route>
        <Route path='/' element={<TradePage />} />
        <Route path='/wallets/:address'>
          <Route path='execute' element={<ExecuteMessagePage />} />
          <Route path='trade' element={<TradePage />} />
          <Route path='trade-advanced' element={<TradePage />} />
          {chainConfig.perps && <Route path='perps' element={<PerpsPage />} />}
          <Route path='farm' element={<FarmPage />} />
          <Route path='lend' element={<LendPage />} />
          {chainConfig.perps && <Route path='perps-vault' element={<PerpsVaultPage />} />}
          <Route path='borrow' element={<BorrowPage />} />
          <Route path='portfolio' element={<PortfolioPage />} />
          {chainConfig.hls && <Route path='hls-staking' element={<HlsStakingPage />} />}
          {chainConfig.hls && <Route path='hls-farm' element={<HlsFarmPage />} />}
          <Route path='vaults' element={<VaultsOfficialPage />}>
            <Route path='create' element={<CreateVault />} />
          </Route>
          <Route path='vaults-community' element={<VaultsCommunityPage />} />
          <Route path='vaults/:vaultAddress'>
            <Route path='mint-account' element={<MintVaultAccount />} />
            {/* TODO */}
            {/* <Route path='delete' element={} /> */}
          </Route>
          <Route path='v1' element={<V1Page />} />
          <Route path='portfolio/:accountId'>
            <Route path='' element={<PortfolioAccountPage />} />
          </Route>
          <Route path='' element={<TradePage />} />
        </Route>
        <Route path='*' element={<Navigate to='/' />} />
      </Route>
    </RoutesWrapper>
  )
}
