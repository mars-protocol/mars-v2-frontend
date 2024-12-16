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
import PerpsVaultPage from 'pages/PerpsVaultPage'
import PortfolioAccountPage from 'pages/PortfolioAccountPage'
import PortfolioPage from 'pages/PortfolioPage'
import TradePage from 'pages/TradePage'
import V1Page from 'pages/V1Page'

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
        <Route path='/lend' element={<LendPage />} />
        <Route path='/perps-vault' element={<PerpsVaultPage />} />
        <Route path='/borrow' element={<BorrowPage />} />
        <Route path='/portfolio' element={<PortfolioPage />} />
        <Route path='/v1' element={<V1Page />} />
        <Route path='/hls-staking' element={<HlsStakingPage />} />
        <Route path='/hls-farm' element={<HlsFarmPage />} />
        <Route
          path='/'
          element={
            chainConfig.perps ? <Navigate to='/perps' replace /> : <Navigate to='/trade' replace />
          }
        />
        <Route path='/wallets/:address'>
          <Route path='execute' element={<ExecuteMessagePage />} />
          <Route path='trade' element={<TradePage />} />
          <Route path='trade-advanced' element={<TradePage />} />
          <Route path='perps' element={<PerpsPage />} />
          <Route path='farm' element={<FarmPage />} />
          <Route path='lend' element={<LendPage />} />
          <Route path='perps-vault' element={<PerpsVaultPage />} />
          <Route path='borrow' element={<BorrowPage />} />
          <Route path='portfolio' element={<PortfolioPage />} />
          <Route path='hls-staking' element={<HlsStakingPage />} />
          <Route path='hls-farm' element={<HlsFarmPage />} />
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
