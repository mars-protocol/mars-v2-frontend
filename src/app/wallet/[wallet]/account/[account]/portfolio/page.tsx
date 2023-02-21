import getCreditAccounts from 'libs/getCreditAccounts'

export default async function page({ params }: { params: PageParams }) {
  const creditAccounts = await getCreditAccounts(params.wallet)

  throw 'askdfjks'
  return (
    <div className='flex w-full items-start gap-4'>
      <ul>
        {creditAccounts.map((account) => (
          <li>{account}</li>
        ))}
      </ul>
    </div>
  )
}
