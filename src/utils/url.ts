export const getUrl = (baseUrl: string, path: string): string => {
  const url = new URL(baseUrl)

  if (process.env.NEXT_PUBLIC_API_KEY)
    return `${url.href}${path}?x-apikey=${process.env.NEXT_PUBLIC_API_KEY}`

  return url.href + path
}
