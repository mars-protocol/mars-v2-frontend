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

    const vaultInfo = {
      title: 'Mars Protocol Vault',
      tvl: 0,
      apr: 0,
    }

    if (data) {
      vaultInfo.title = data.title ?? 'Mars Protocol Vault'
      vaultInfo.apr = data.apr ?? 0
      vaultInfo.tvl = data.tvl ?? 0
    }

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
              backgroundImage:
                'url(data:image/jpeg;base64,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)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Vault Info */}
          <div
            style={{
              position: 'absolute',
              top: '200px',
              left: '60px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              zIndex: 1,
              alignItems: 'center',
              width: '720px',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: '40px',
                color: '#fcfcf4',
                maxWidth: '720px',
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
                    fontSize: '20px',
                    backgroundColor: '#101112',
                    padding: '6px 20px',
                  }}
                >
                  APY
                </div>
                <div
                  style={{
                    color: '#fcfcf4',
                    fontSize: '40px',
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
                    fontSize: '20px',
                    backgroundColor: '#101112',
                    padding: '6px 20px',
                  }}
                >
                  TVL
                </div>
                <div
                  style={{
                    color: '#fcfcf4',
                    fontSize: '40px',
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
                bottom: '50px',
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
        width: 1033,
        height: 541,
        status: 200,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=600, s-maxage=600, must-revalidate',
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
