interface TokenPricesResult {
  prices: {
    [key: string]: {
      denom: string
      price: string
    }
  }
}
