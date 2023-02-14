import classNames from 'classnames'
import { DesktopNavigation } from 'components/Navigation/DesktopNavigation'
import 'react-toastify/dist/ReactToastify.min.css'
import '../styles/globals.css'

const filter = {
  day: 'brightness-100 hue-rotate-0',
  night: '-hue-rotate-82 brightness-30',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const backgroundClasses = classNames(
    true ? filter.day : filter.night,
    'top-0 left-0 absolute block h-full w-full flex-col bg-body bg-mars bg-desktop bg-top bg-no-repeat filter',
    true && 'transition-background duration-3000 ease-linear',
  )

  return (
    <html lang='en'>
      <head />
      <body>
        <div className='relative min-h-screen w-full'>
          <div className={backgroundClasses} />
          <DesktopNavigation />
          <main className='relative flex lg:min-h-[calc(100vh-120px)]'>
            <div className='flex flex-grow flex-wrap p-6'>{children}</div>
            {/* {true && <AccountDetails />} */}
          </main>
          {/* <CookieConsent /> */}
        </div>
      </body>
    </html>
  )
}
