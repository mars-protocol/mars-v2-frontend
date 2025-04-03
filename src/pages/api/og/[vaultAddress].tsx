import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  try {
    // temporary for local images:
    const host = req.headers.get('host') || 'localhost:3000'
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
    const { pathname } = new URL(req.url)
    const segments = pathname.split('/')
    const vaultAddress = segments[segments.length - 1]

    if (!vaultAddress) {
      return new Response('Missing vault address', { status: 400 })
    }

    const response = await fetch(
      `https://backend.test.mars-dev.net/v2/managed_vaults?chain=neutron&address=${vaultAddress}`,
    ).then((res) => res.json())
    const data = response.data[0]

    console.log('my data', data)
    if (!data) {
      return new Response('Vault not found', { status: 404 })
    }

    const vaultInfo = data
    const formattedTVL = vaultInfo.tvl
      ? `$${(Number(vaultInfo.tvl) / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      : 'N/A'

    const formattedAPR = vaultInfo.apr ? `${Number(vaultInfo.apr).toFixed(2)}%` : 'N/A'

    const formattedFeeRate = vaultInfo.fee_rate
      ? `${(Number(vaultInfo.fee_rate) * 100000).toFixed(2)}%`
      : '0%'

    // temp for local development
    const imageResponse = await fetch(`${protocol}://${host}/mars_preview.png`)
    const contentType = imageResponse.headers.get('content-type') || 'image/png'
    const backgroundImageData = await imageResponse.arrayBuffer()

    // Convert ArrayBuffer to base64 string for data URL with proper content type
    const base64Image = Buffer.from(backgroundImageData).toString('base64')
    const imageDataUrl = `data:${contentType};base64,${base64Image}`

    // todo: clean up
    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              opacity: 1,
              backgroundImage: `url(${imageDataUrl})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Vault Info */}
          <div
            style={{
              position: 'absolute',
              top: '200px',
              left: '50px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              zIndex: 1,
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: 'white',
                lineHeight: 1.2,
                display: 'flex',
              }}
            >
              {vaultInfo.title + ' | Mars Vault' || 'Mars Protocol Vault'}
            </div>
            <div
              style={{
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: 1.4,
                display: 'flex',
              }}
            >
              {vaultInfo.description || 'A powerful vault on Mars Protocol'}
            </div>

            {/* Metrics Row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '16px',
                marginTop: '48px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px', display: 'flex' }}
                >
                  APR
                </div>
                <div
                  style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', display: 'flex' }}
                >
                  {formattedAPR}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px', display: 'flex' }}
                >
                  TVL
                </div>
                <div
                  style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', display: 'flex' }}
                >
                  {formattedTVL}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '12px 20px',
                  borderRadius: '12px',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '18px', display: 'flex' }}
                >
                  Fee Rate
                </div>
                <div
                  style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', display: 'flex' }}
                >
                  {formattedFeeRate}
                </div>
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div
            style={{
              position: 'absolute',
              bottom: 40,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: '40px',
              color: 'white',
              fontSize: 20,
              fontFamily: 'sans-serif',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='white'>
                <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z' />
              </svg>
              app.marsprotocol.io
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='white'>
                <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z' />
              </svg>
              mars_protocol
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='white'>
                <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.47-1.13 7.25-.14.74-.42 1.2-.68 1.23-.57.05-1-.38-1.53-.75-1.02-.7-1.58-1.13-2.58-1.81-.91-.61-.32-1.02.2-1.61.13-.15 2.4-2.17 2.47-2.36.01-.02.02-.1-.05-.14s-.17-.03-.25-.02c-.11.03-1.88 1.14-5.31 3.34-.5.33-.96.5-1.37.48-.45-.01-1.32-.24-1.96-.44-.79-.24-1.42-.37-1.37-.79.03-.24.29-.47.79-.71 3.16-1.35 5.26-2.24 6.3-2.69 3-.13 3.62-.03 4.26.24.28.12.49.39.51.67.03.29-.09.7-.3 1.01z' />
              </svg>
              @marsprotocol
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg width='24' height='24' viewBox='0 0 24 24' fill='white'>
                <path d='M19.27 5.33C17.94 4.71 16.5 4.26 15 4a.09.09 0 0 0-.07.03c-.18.33-.39.76-.53 1.09a16.09 16.09 0 0 0-4.8 0c-.14-.34-.35-.76-.54-1.09c-.01-.02-.04-.03-.07-.03c-1.5.26-2.93.71-4.27 1.33c-.01 0-.02.01-.03.02c-2.72 4.07-3.47 8.03-3.1 11.95c0 .02.01.04.03.05c1.8 1.32 3.53 2.12 5.24 2.65c.03.01.06 0 .07-.02c.4-.55.76-1.13 1.07-1.74c.02-.04 0-.08-.04-.09c-.57-.22-1.11-.48-1.64-.78c-.04-.02-.04-.08-.01-.11c.11-.08.22-.17.33-.25c.02-.02.05-.02.07-.01c3.44 1.57 7.15 1.57 10.55 0c.02-.01.05-.01.07.01c.11.09.22.17.33.26c.04.03.04.09-.01.11c-.52.31-1.07.56-1.64.78c-.04.01-.05.06-.04.09c.32.61.68 1.19 1.07 1.74c.03.01.06.02.09.01c1.72-.53 3.45-1.33 5.25-2.65c.02-.01.03-.03.03-.05c.44-4.53-.73-8.46-3.1-11.95c-.01-.01-.02-.02-.04-.02zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12c0 1.17-.83 2.12-1.89 2.12z' />
              </svg>
              discord.marsprotocol.io
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    )
  } catch (e: unknown) {
    console.log(`Error generating OG image: ${e}`)
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred'
    return new Response(`Error: ${errorMessage}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}
