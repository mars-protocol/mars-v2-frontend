import { useQuery } from '@tanstack/react-query'

const useTokenPrices = () => {
  return useQuery<{ [key in string]: number }>(
    ['tokenPrices'],
    () => ({
      uosmo: 1.1,
      'ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2': 11,
    }),
    {
      staleTime: Infinity,
    }
  )
}

export default useTokenPrices
