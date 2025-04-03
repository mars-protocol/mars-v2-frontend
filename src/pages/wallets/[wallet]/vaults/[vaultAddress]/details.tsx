import { GetServerSideProps } from 'next'
import Head from 'next/head'

export default function VaultDetailsPage({ vault }: { vault: any }) {
  console.log('this is the vault', vault)

  return (
    <>
      <Head>
        {vault && vault.vault_address ? (
          <>
            <title>{vault.title || 'Vault'} | Mars Protocol</title>
            <meta
              key='og:title'
              property='og:title'
              content={`${vault.title || 'Vault'} | Mars Protocol`}
            />
            <meta
              key='og:description'
              property='og:description'
              content={vault.description || ''}
            />
            <meta key='og:image' property='og:image' content={`/api/og/${vault.vault_address}`} />
            <meta key='twitter:card' property='twitter:card' content='summary_large_image' />
            <meta
              key='twitter:title'
              property='twitter:title'
              content={`${vault.title || 'Vault'} | Mars Protocol`}
            />
            <meta
              key='twitter:description'
              property='twitter:description'
              content={vault.description || ''}
            />
            <meta property='twitter:image' content={`/api/og/${vault.vault_address}`} />
          </>
        ) : (
          <title>Mars Protocol</title>
        )}
      </Head>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { vaultAddress } = context.params || {}
  const userAgent = context.req.headers['user-agent'] || ''
  const isCrawler = /facebook|twitter|linkedin|bot|crawl|spider/i.test(userAgent)

  if (isCrawler) {
    try {
      const response = await fetch(
        `https://backend.test.mars-dev.net/v2/managed_vaults?chain=neutron&address=${vaultAddress}`,
      )
      const data = await response.json()

      if (data?.data?.[0]) {
        return {
          props: {
            vault: data.data[0],
          },
        }
      }
    } catch (error) {
      console.error('Error fetching vault data:', error)
    }
  }

  return {
    props: {
      vault: {},
    },
  }
}
