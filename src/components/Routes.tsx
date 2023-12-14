import { Navigate, Outlet, Route, Routes as RoutesWrapper } from 'react-router-dom'

import Layout from 'pages/_layout'
import BorrowPage from 'pages/BorrowPage'
import ExecuteMessagePage from 'pages/ExecuteMessagePage'
import FarmPage from 'pages/FarmPage'
import HLSFarmPage from 'pages/HLSFarmPage'
import HLSStakingPage from 'pages/HLSStakingPage'
import LendPage from 'pages/LendPage'
import MobilePage from 'pages/MobilePage'
import PerpsPage from 'pages/PerpsPage'
import PortfolioAccountPage from 'pages/PortfolioAccountPage'
import PortfolioPage from 'pages/PortfolioPage'
import TradePage from 'pages/TradePage'
import { ENABLE_HLS, ENABLE_PERPS } from 'utils/constants'

export default function Routes() {
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
        {ENABLE_PERPS && <Route path='/perps' element={<PerpsPage />} />}
        <Route path='/farm' element={<FarmPage />} />
        <Route path='/lend' element={<LendPage />} />
        <Route path='/borrow' element={<BorrowPage />} />
        <Route path='/portfolio' element={<PortfolioPage />} />
        <Route path='/mobile' element={<MobilePage />} />
        {ENABLE_HLS && <Route path='/hls-staking' element={<HLSStakingPage />} />}
        {ENABLE_HLS && <Route path='/hls-farm' element={<HLSFarmPage />} />}
        <Route path='/' element={<TradePage />} />
        <Route path='/wallets/:address'>
          <Route path='execute' element={<ExecuteMessagePage />} />
          <Route path='trade' element={<TradePage />} />
          <Route path='trade-advanced' element={<TradePage />} />
          {ENABLE_PERPS && <Route path='perps' element={<PerpsPage />} />}
          <Route path='farm' element={<FarmPage />} />
          <Route path='lend' element={<LendPage />} />
          <Route path='borrow' element={<BorrowPage />} />
          <Route path='portfolio' element={<PortfolioPage />} />
          {ENABLE_HLS && <Route path='hls-staking' element={<HLSStakingPage />} />}
          {ENABLE_HLS && <Route path='hls-farm' element={<HLSFarmPage />} />}
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
