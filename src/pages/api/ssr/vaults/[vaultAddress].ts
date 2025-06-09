import moment from 'moment'
import { NextApiRequest, NextApiResponse } from 'next'
import { getManagedVaultsUrl } from 'utils/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { vaultAddress } = req.query
  const unixTime = moment().unix()

  try {
    const response = await fetch(getManagedVaultsUrl(vaultAddress as string))
    const data = await response.json()
    const vault = data?.data?.[0]

    if (!vault) {
      return res.status(404).json({ error: 'Vault not found' })
    }

    const title = vault.title ? `${vault.title}` : 'Mars Protocol'
    const description =
      vault.description ||
      "Trade spot, margin and perps, lend, and earn on the Cosmos' most powerful credit protocol."

    const host = req.rawHeaders[req.rawHeaders.length - 1]

    const html = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0" />
          <title>${title}</title>
          <meta property="og:url" content="https://${host}/vaults/${vault.vault_address}/details" />
          <meta property="og:title" content="${title}" />
          <meta property="og:description" content="${description}" />
          <meta property="og:image" content="https://${host}/api/og/${vault.vault_address}/${unixTime}" />
          <meta property="twitter:title" content="${title}" />
          <meta property="twitter:description" content="${description}" />
          <meta property="twitter:image" content="https://${host}/api/og/${vault.vault_address}/${unixTime}" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:site" content="@mars_protocol" />
          <meta name="twitter:creator" content="@mars_protocol" />
          <meta name=”twitter:image:alt” content="${title}">
        </head>
        <body>
          <h1>${title}</h1>
          <p>${description}</p>
        </body>
      </html>
    `

    res.setHeader('Content-Type', 'text/html')
    res.status(200).send(html)
  } catch (error) {
    console.error('Error fetching vault data:', error)
    res.status(500).json({ error: 'Internal server error: ' + error })
  }
}
