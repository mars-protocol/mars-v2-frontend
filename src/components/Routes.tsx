import { Outlet, Route, Routes as RoutesWrapper } from 'react-router-dom'

import Layout from 'pages/_layout'
import BorrowPage from 'pages/BorrowPage'
import FarmPage from 'pages/FarmPage'
import LendPage from 'pages/LendPage'
import MobilePage from 'pages/MobilePage'
import PortfolioAccountPage from 'pages/PortfolioAccountPage'
import PortfolioPage from 'pages/PortfolioPage'
import TradePage from 'pages/TradePage'

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
        <Route path='/' element={<TradePage />} />
        <Route path='/wallets/:address'>
          <Route path='trade' element={<TradePage />} />
          <Route path='farm' element={<FarmPage />} />
          <Route path='lend' element={<LendPage />} />
          <Route path='borrow' element={<BorrowPage />} />
          <Route path='portfolio' element={<PortfolioPage />} />
          <Route path='portfolio/:accountId'>
            <Route path='' element={<PortfolioAccountPage />} />
          </Route>
          <Route path='' element={<TradePage />} />
        </Route>
      </Route>
    </RoutesWrapper>
  )
}
