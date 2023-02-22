import { AccountNavigation } from 'components/Account/AccountNavigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className='relative hidden bg-header lg:block'>
        <AccountNavigation />
      </div>
      {children}
    </>
  )
}
