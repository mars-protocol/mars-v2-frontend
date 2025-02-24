export async function fetchWithTimeout(url: string, timeout: number) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
    }).catch(() => {
      return new Response(null, {
        status: 404,
        statusText: 'Network request failed',
      })
    })

    clearTimeout(id)
    return response
  } catch (error) {
    clearTimeout(id)
    return new Response(null, {
      status: 408,
      statusText: 'Request timeout',
    })
  }
}
