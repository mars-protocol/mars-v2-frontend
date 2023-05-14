import { Outlet, Route, Routes } from 'react-router-dom'

import BorrowPage from 'pages/BorrowPage'
import CouncilPage from 'pages/CouncilPage'
import FarmPage from 'pages/FarmPage'
import LendPage from 'pages/LendPage'
import PortfolioPage from 'pages/PortfolioPage'
import TradePage from 'pages/TradePage'
import Layout from 'pages/_layout'

export default function RouterOutlet() {
  return (
    <Routes>
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
        <Route path='/council' element={<CouncilPage />} />
        <Route path='/' element={<TradePage />} />
        <Route path='/wallets/:address/trade' element={<TradePage />} />
        <Route path='/wallets/:address'>
          <Route path='accounts/:accountId'>
            <Route path='trade' element={<TradePage />} />
            <Route path='farm' element={<FarmPage />} />
            <Route path='lend' element={<LendPage />} />
            <Route path='borrow' element={<BorrowPage />} />
            <Route path='portfolio' element={<PortfolioPage />} />
            <Route path='council' element={<CouncilPage />} />
            <Route path='' element={<TradePage />} />
          </Route>
          <Route path='trade' element={<TradePage />} />
          <Route path='farm' element={<FarmPage />} />
          <Route path='lend' element={<LendPage />} />
          <Route path='borrow' element={<BorrowPage />} />
          <Route path='portfolio' element={<PortfolioPage />} />
          <Route path='council' element={<CouncilPage />} />
          <Route path='' element={<TradePage />} />
        </Route>
      </Route>
    </Routes>
  )
}
