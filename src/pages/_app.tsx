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
import Tradepage from 'components/pages/trade'
import Borrowpage from 'components/pages/borrow'
import Portfoliopage from 'components/pages/portfolio'
import Councilpage from 'components/pages/council'
import Farmpage from 'components/pages/farm'
import Lendpage from 'components/pages/lend'

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
            <Route path='/trade' element={<Tradepage />} />
            <Route path='/farm' element={<Farmpage />} />
            <Route path='/lend' element={<Lendpage />} />
            <Route path='/borrow' element={<Borrowpage />} />
            <Route path='/portfolio' element={<Portfoliopage />} />
            <Route path='/council' element={<Councilpage />} />
            <Route path='/' element={<Tradepage />} />
            <Route path='/wallets/:address/trade' element={<Tradepage />} />
            <Route path='/wallets/:address'>
              <Route path='accounts/:accountId'>
                <Route path='trade' element={<Tradepage />} />
                <Route path='farm' element={<Farmpage />} />
                <Route path='lend' element={<Lendpage />} />
                <Route path='borrow' element={<Borrowpage />} />
                <Route path='portfolio' element={<Portfoliopage />} />
                <Route path='council' element={<Councilpage />} />
                <Route path='' element={<Tradepage />} />
              </Route>
              <Route path='trade' element={<Tradepage />} />
              <Route path='farm' element={<Farmpage />} />
              <Route path='lend' element={<Lendpage />} />
              <Route path='borrow' element={<Borrowpage />} />
              <Route path='portfolio' element={<Portfoliopage />} />
              <Route path='council' element={<Councilpage />} />
              <Route path='' element={<Tradepage />} />
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
