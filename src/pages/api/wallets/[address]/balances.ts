import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const address = req.query.address
  const uri = '/cosmos/bank/v1beta1/balances/'
  const url = `${process.env.NEXT_PUBLIC_REST}${uri}${address}`

  const response = await fetch(url)

  const data = 

  if (response.ok) {
    return res.status(200).json(response.json())
  }

  return res.status(404)
}
