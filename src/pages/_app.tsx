import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import { BrowserRouter } from 'react-router-dom'

import AccountDetails from 'components/Account/AccountDetails'
import Background from 'components/Background'
import Footer from 'components/Footer'
import DesktopHeader from 'components/Header/DesktopHeader'
import ModalsContainer from 'components/Modals/ModalsContainer'
import Toaster from 'components/Toaster'
import 'react-toastify/dist/ReactToastify.min.css'
import 'styles/globals.css'
import BorrowPage from 'pages/BorrowPage'
import PortfolioPage from './PortfolioPage'
import FarmPage from './FarmPage'
import TradePage from './TradePage'
import LendPage from './LendPage'
import CouncilPage from './CouncilPage'

function App() {
  const [isServer, setIsServer] = useState(true)
  useEffect(() => {
    setIsServer(false)
  }, [])
  if (isServer) return null

  return (
    <BrowserRouter>
      <Background />
      <DesktopHeader />
      <main
        className={classNames(
          'relative flex justify-center pt-6',
          'lg:mt-[65px] lg:h-[calc(100vh-89px)]',
        )}
      >
        <div className='flex w-full max-w-content flex-grow flex-wrap content-start'>
          <Routes>
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
          </Routes>
        </div>
        <AccountDetails />
      </main>
      <Footer />
      <ModalsContainer />
      <Toaster />
    </BrowserRouter>
  )
}

export default App
