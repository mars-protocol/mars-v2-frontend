import { GetServerSideProps } from 'next'
import { useRouter } from 'next/router'
import VaultDetails from 'components/managedVaults/community/vaultDetails'
import { useEffect, useState } from 'react'

export default function VaultDetailsPage() {
  const router = useRouter()
  const { vaultAddress } = router.query
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='flex flex-col items-center gap-4'>
          <div className='animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900'></div>
          <p className='text-xl'>Loading vault details...</p>
        </div>
      </div>
    )
  }

  return <VaultDetails vaultAddress={vaultAddress as string} />
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const userAgent = context.req.headers['user-agent'] || ''
  const isCrawler = /facebook|twitter|linkedin|bot|crawl|spider/i.test(userAgent)

  if (isCrawler) {
    return {
      redirect: {
        destination: `/api/ssr/vaults/${context.params?.vaultAddress}`,
        permanent: false,
      },
    }
  }

  return {
    props: {},
  }
}
