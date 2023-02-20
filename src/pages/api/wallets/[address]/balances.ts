import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = process.env.NEXT_PUBLIC_REST

  if (!url) {
    return res.status(404).json({ message: 'Env variables missing' })
  }

  const address = req.query.address
  const uri = '/cosmos/bank/v1beta1/balances/'

  const response = await fetch(`${url}${uri}${address}`)

  if (response.ok) {
    const data = await response.json()
    return res.status(200).json(data.balances)
  }

  return res.status(404)
}
