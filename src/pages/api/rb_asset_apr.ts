import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chain, granularity, unit, denom } = req.query

  const url = new URL(`/v2/rb_asset_apr`, 'https://backend.prod.mars-dev.net')
  if (typeof chain === 'string') url.searchParams.set('chain', chain)
  if (typeof granularity === 'string') url.searchParams.set('granularity', granularity)
  if (typeof unit === 'string') url.searchParams.set('unit', unit)
  if (typeof denom === 'string') url.searchParams.set('denom', denom)

  const apiKey = process.env.API_KEY ?? ''
  const headers: Record<string, string> = {}
  if (apiKey) headers['x-apikey'] = apiKey

  try {
    const upstream = await fetch(url.toString(), { headers })
    const json = await upstream.json()
    res.status(upstream.ok ? 200 : upstream.status).json(json)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
