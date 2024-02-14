export const getUrl = (baseUrl: string, path: string): string => {
  const isPlaceholder = baseUrl.split('APP_').length > 1

  if (isPlaceholder) {
    return baseUrl + '/' + path
  }

  const url = new URL(baseUrl)

  if (process.env.NEXT_PUBLIC_API_KEY)
    return `${url.href}${path}?x-apikey=${process.env.NEXT_PUBLIC_API_KEY}`

  return url.href + path
}
