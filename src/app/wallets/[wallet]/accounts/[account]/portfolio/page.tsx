import getCreditAccounts from 'libs/getCreditAccounts'

export default async function page({ params }: { params: PageParams }) {
  const creditAccounts = await getCreditAccounts(params.wallet)

  return (
    <div className='flex w-full items-start gap-4'>
      <ul>
        {creditAccounts.map((account: string, index: number) => (
          <li key={index}>{account}</li>
        ))}
      </ul>
    </div>
  )
}
