import { Navigate, Outlet, Route, Routes as RoutesWrapper } from 'react-router-dom'

import AssetDetailPage from 'pages/AssetDetailPage'
import CreateVault from 'components/managedVaults/createVault/index'
import VaultDetails from 'components/managedVaults/vaultDetails/index'
import useChainConfig from 'hooks/chain/useChainConfig'
import Layout from 'pages/_layout'
import BankPage from 'pages/BankPage'
import ExecuteMessagePage from 'pages/ExecuteMessagePage'
import FarmPage from 'pages/FarmPage'
import PerpsPage from 'pages/PerpsPage'
import PortfolioAccountPage from 'pages/PortfolioAccountPage'
import PortfolioPage from 'pages/PortfolioPage'
import PortfolioV1Page from 'pages/PortfolioV1Page'
import TradePage from 'pages/TradePage'
import V1Page from 'pages/V1Page'
import VaultsCommunityPage from 'pages/VaultsCommunityPage'

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
        <Route path='/perps' element={<PerpsPage />} />
        <Route path='/farm' element={<FarmPage />} />
        <Route path='/perps-vault' element={<Navigate to='/vaults' replace />} />
        <Route path='/earn' element={<Navigate to='/bank' replace />} />
        <Route path='/borrow' element={<Navigate to='/bank' replace />} />
        <Route path='/bank' element={<BankPage />} />
        <Route path='/portfolio' element={<PortfolioPage />} />
        <Route path='/v1' element={<V1Page />} />
        <Route path='/assets/:symbol' element={<AssetDetailPage />} />
        <Route
          path='/'
          element={
            chainConfig.perps ? <Navigate to='/perps' replace /> : <Navigate to='/trade' replace />
          }
        />

        <Route path='/vaults'>
          <Route path='' element={<VaultsCommunityPage />} />
          <Route path='create' element={<CreateVault />} />
          <Route path=':vaultAddress'>
            <Route path='details' element={<VaultDetails />} />
          </Route>
        </Route>

        <Route path='/wallets/:address'>
          <Route
            path=''
            element={
              chainConfig.perps ? <Navigate to='perps' replace /> : <Navigate to='trade' replace />
            }
          />
          <Route path='execute' element={<ExecuteMessagePage />} />
          <Route path='trade' element={<TradePage />} />
          <Route path='trade-advanced' element={<TradePage />} />
          <Route path='perps' element={<PerpsPage />} />
          <Route path='farm' element={<FarmPage />} />
          <Route path='perps-vault' element={<Navigate to='/vaults' replace />} />
          <Route path='earn' element={<Navigate to='bank' replace />} />
          <Route path='borrow' element={<Navigate to='bank' replace />} />
          <Route path='bank' element={<BankPage />} />
          <Route path='portfolio' element={<PortfolioPage />} />
          <Route path='v1' element={<V1Page />} />

          <Route path='vaults'>
            <Route path=':vaultAddress'>
              <Route path='details' element={<VaultDetails />} />
            </Route>
            <Route path='create' element={<CreateVault />} />
            <Route path='' element={<VaultsCommunityPage />} />
          </Route>

          <Route path='portfolio/:accountId'>
            <Route path='' element={<PortfolioAccountPage />} />
          </Route>

          <Route path='portfolio/v1'>
            <Route path='' element={<PortfolioV1Page />} />
          </Route>

          <Route path='assets/:symbol' element={<AssetDetailPage />} />
        </Route>

        <Route path='*' element={<Navigate to='/' />} />
      </Route>
    </RoutesWrapper>
  )
}
