import { formatValue } from 'utils/formatters'
import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { PRICE_ORACLE_DECIMALS } from 'constants/query'
import { getManagedVaultsUrl } from 'utils/api'

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  try {
    const { pathname } = new URL(req.url)
    const segments = pathname.split('/')
    const vaultAddress = segments[segments.length - 1]

    if (!vaultAddress) {
      return new Response('Missing vault address', { status: 400 })
    }

    const response = await fetch(getManagedVaultsUrl(vaultAddress)).then((res) => res.json())
    const data = response.data[0]

    if (!data) {
      return new Response('Vault not found', { status: 404 })
    }

    const vaultInfo = data
    const formattedTVL = vaultInfo.tvl
      ? formatValue(Number(vaultInfo.tvl), {
          abbreviated: true,
          prefix: '$',
          decimals: PRICE_ORACLE_DECIMALS,
        })
      : 'N/A'

    // Convert APR to APY with daily compounding
    const apr = Number(vaultInfo.apr)
    const apy = apr ? ((1 + apr / 36500) ** 365 - 1) * 100 : null
    const formattedAPY = apy ? `${apy.toFixed(2)}%` : 'N/A'

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
        </div>
      ),
      {
        width: 1280,
        height: 720,
        fonts: [
          {
            name: 'Inter',
            data: await fetch(new URL('/src/fonts/Inter-SemiBold.woff', import.meta.url)).then(
              (res) => res.arrayBuffer(),
            ),
            style: 'normal',
          },
        ],
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
