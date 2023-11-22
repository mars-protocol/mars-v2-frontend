import { Navigate, Outlet, Route, Routes as RoutesWrapper } from 'react-router-dom'

import BorrowPage from 'pages/BorrowPage'
import FarmPage from 'pages/FarmPage'
import HLSFarmPage from 'pages/HLSFarmPage'
import HLSStakingPage from 'pages/HLSStakingPage'
import LendPage from 'pages/LendPage'
import MobilePage from 'pages/MobilePage'
import PortfolioAccountPage from 'pages/PortfolioAccountPage'
import PortfolioPage from 'pages/PortfolioPage'
import StatsPage from 'pages/StatsPage'
import TradePage from 'pages/TradePage'
import Layout from 'pages/_layout'
import { ENABLE_HLS } from 'utils/constants'

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
        <Route path='/farm' element={<FarmPage />} />
        <Route path='/lend' element={<LendPage />} />
        <Route path='/borrow' element={<BorrowPage />} />
        <Route path='/portfolio' element={<PortfolioPage />} />
        <Route path='/mobile' element={<MobilePage />} />
        {ENABLE_HLS && <Route path='/hls-staking' element={<HLSStakingPage />} />}
        {ENABLE_HLS && <Route path='/hls-farm' element={<HLSFarmPage />} />}
        <Route path='/stats' element={<StatsPage />} />
        <Route path='/stats-farm' element={<StatsPage />} />
        <Route path='/stats-lend-borrow' element={<StatsPage />} />
        <Route path='/stats-accounts' element={<StatsPage />} />
        <Route path='/' element={<TradePage />} />
        <Route path='/wallets/:address'>
          <Route path='trade' element={<TradePage />} />
          <Route path='farm' element={<FarmPage />} />
          <Route path='lend' element={<LendPage />} />
          <Route path='borrow' element={<BorrowPage />} />
          <Route path='portfolio' element={<PortfolioPage />} />
          {ENABLE_HLS && <Route path='hls-staking' element={<HLSStakingPage />} />}
          {ENABLE_HLS && <Route path='hls-farm' element={<HLSFarmPage />} />}
          <Route path='stats' element={<StatsPage />} />
          <Route path='stats-farm' element={<StatsPage />} />
          <Route path='stats-lend-borrow' element={<StatsPage />} />
          <Route path='stats-accounts' element={<StatsPage />} />
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
