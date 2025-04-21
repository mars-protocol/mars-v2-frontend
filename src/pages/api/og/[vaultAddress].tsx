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

    if (!data) {
      return new Response('Vault not found', { status: 404 })
    }

    const vaultInfo = data
    const formattedTVL = vaultInfo.tvl
      ? `$${(Number(vaultInfo.tvl) / 1000000).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      : 'N/A'

    // Convert APR to APY with daily compounding
    const apr = Number(vaultInfo.apr)
    const apy = apr ? ((1 + apr / 36500) ** 365 - 1) * 100 : null
    const formattedAPY = apy ? `${apy.toFixed(2)}%` : 'N/A'

    const formattedFeeRate = vaultInfo.fee_rate
      ? `${(Number(vaultInfo.fee_rate) * 100000).toFixed(2)}%`
      : '0%'

    // temporary for local development
    const imageResponse = await fetch(`${protocol}://${host}/mars_preview.png`)
    const contentType = imageResponse.headers.get('content-type') || 'image/png'
    const backgroundImageData = await imageResponse.arrayBuffer()
    const base64Image = Buffer.from(backgroundImageData).toString('base64')
    const imageDataUrl = `data:${contentType};base64,${base64Image}`

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            fontFamily: 'Inter',
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
              top: '65%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              zIndex: 1,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                fontSize: 50,
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              {vaultInfo.title || 'Mars Protocol Vault'}
            </div>

            {/* Metrics Row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '16px',
                marginTop: '18px',
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
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '34px' }}>APY</div>
                <div style={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}>
                  {formattedAPY}
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
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '34px' }}>TVL</div>
                <div style={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}>
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
                <div style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '34px' }}>Fee Rate</div>
                <div style={{ color: 'white', fontSize: '32px', fontWeight: 'bold' }}>
                  {formattedFeeRate}
                </div>
              </div>
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
    console.error(`Error generating OG image: ${e}`)
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred'
    return new Response(`Error: ${errorMessage}`, {
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    })
  }
}
