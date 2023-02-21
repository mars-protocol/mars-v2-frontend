import { AccountNavigation } from 'components/Account/AccountNavigation'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <div className='relative hidden bg-header lg:block'>
        <div className='flex flex-col'>
          <div className='flex items-center justify-between border-b border-white/20 pl-6 text-sm text-white/40'>
            <div className='flex items-center'>
              <AccountNavigation />
            </div>
          </div>
        </div>
      </div>
      {children}
    </>
  )
}
