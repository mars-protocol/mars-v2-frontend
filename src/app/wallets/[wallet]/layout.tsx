import { AccountNavigation } from 'components/Account/AccountNavigation'
import { getCreditAccounts } from 'utils/api'

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: PageParams
}) {
  const creditAccounts = await getCreditAccounts(params.wallet)

  return (
    <>
      <div className='relative hidden bg-header lg:block'>
        <AccountNavigation creditAccounts={creditAccounts} />
      </div>
      <main className='p-4'>{children}</main>
    </>
  )
}
