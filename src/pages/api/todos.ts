import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos')

  const data = await response.json()
  return res.status(200).json(data)
}
