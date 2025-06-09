import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { getManagedVaultsUrl } from 'utils/api'
import { formatValue } from 'utils/edgeFormatters'

export const config = {
  runtime: 'edge',
}
export const revalidate = 0
export const fetchCache = 'no-store'
export const dynamic = 'force-dynamic'

export default async function handler(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url)
    const segments = pathname.split('/')
    const vaultAddress = segments[segments.length - 2]

    if (!vaultAddress) {
      return new Response('Missing vault address', { status: 400 })
    }

    const response = await fetch(getManagedVaultsUrl(vaultAddress), {
      cache: 'no-store',
      next: { revalidate: 0 },
    }).then((res) => res.json())
    const data = response.data[0]

    if (!data) {
      return new Response('Vault not found', { status: 404 })
    }

    const vaultInfo = data
    const formattedTVL = vaultInfo.tvl
      ? formatValue(vaultInfo.tvl, {
          abbreviated: true,
          prefix: '$',
        })
      : 'N/A'

    // Convert APR to APY with daily compounding
    const apr = Number(vaultInfo.apr)
    const apy = apr ? ((1 + apr / 36500) ** 365 - 1) * 100 : null
    const formattedAPY = apy
      ? formatValue(apy, {
          abbreviated: false,
          minDecimals: apy > 100 ? 0 : 2,
          maxDecimals: apy > 100 ? 0 : 2,
          suffix: '%',
        })
      : '0.00%*'

    const showApyNote = !apy

    const imageDataUrl = 'https://app.marsprotocol.io/vaults_banner.png'

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
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Vault Info */}
          <div
            style={{
              position: 'absolute',
              top: '55%',
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
                fontSize: '76px',
                color: 'white',
                textAlign: 'center',
                maxWidth: '1100px',
                wordWrap: 'break-word',
                whiteSpace: 'pre-wrap',
              }}
            >
              {vaultInfo.title || 'Mars Protocol Vault'}
            </div>

            {/* Metrics Row */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '200px',
                marginTop: '30px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '12px 20px',
                    borderRadius: '12px',
                  }}
                >
                  APY
                </div>
                <div
                  style={{
                    color: 'white',
                    fontSize: '80px',
                  }}
                >
                  {formattedAPY}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    fontSize: '40px',
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    padding: '12px 20px',
                    borderRadius: '12px',
                  }}
                >
                  TVL
                </div>
                <div
                  style={{
                    color: 'white',
                    fontSize: '80px',
                  }}
                >
                  {formattedTVL}
                </div>
              </div>
            </div>
          </div>

          {showApyNote && (
            <div
              style={{
                position: 'absolute',
                bottom: 100,
                left: 50,
                color: 'rgba(255,255,255,0.7)',
                fontSize: '22px',
                zIndex: 2,
                textAlign: 'center',
                maxWidth: '100%',
              }}
            >
              * The vault has too little trade data to calculate an APY
            </div>
          )}
        </div>
      ),
      {
        width: 1280,
        height: 720,
        status: 200,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=0, s-maxage=0, must-revalidate',
        },
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
