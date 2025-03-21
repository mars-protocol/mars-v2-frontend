import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html className='p-0 m-0 scrollbar-hide' lang='en'>
      <Head>
        <meta charSet='utf-8' />
        <title>Mars Protocol</title>
        <link href='/favicon.svg' rel='icon' />
        <link href='/apple-touch-icon.png' rel='apple-touch-icon' sizes='180x180' />
        <link href='/site.webmanifest' rel='manifest' />
        <link color='#dd5b65' href='/safari-pinned-tab.svg' rel='mask-icon' />
        <meta content='index,follow' name='robots' />
        <meta content='summary_large_image' name='twitter:card' />
        <meta content='@mars_protocol' name='twitter:site' />
        <meta content='@mars_protocol' name='twitter:creator' />
        <meta
          property='og:description'
          content="Trade spot, margin and perps, lend, and earn on the Cosmos' most powerful credit protocol. Featuring cross-collateralization and a single liquidation point."
        />
        <meta
          name='twitter:description'
          content="Trade spot, margin and perps, lend, and earn on the Cosmos' most powerful credit protocol. Featuring cross-collateralization and a single liquidation point."
        />
        <meta
          name='description'
          content="Trade spot, margin and perps, lend, and earn on the Cosmos' most powerful credit protocol. Featuring cross-collateralization and a single liquidation point."
        />
        <meta content='https://app.marsprotocol.io' property='og:url' />
        <meta content='https://app.marsprotocol.io/banner.png' property='og:image' />
        <meta content='Mars Protocol' property='og:site_name' />
        <meta content='#ffffff' name='msapplication-TileColor' />
        <meta content='#ffffff' name='theme-color' />
        <meta
          name='viewport'
          content='width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0'
        />
        <script defer src='/charting_library/charting_library.standalone.js' />
        <script defer src='/datafeeds/udf/dist/bundle.js' />
        <script defer src='https://cdnjs.cloudflare.com/ajax/libs/socket.io/4.5.4/socket.io.js' />
      </Head>
      <body className='p-0 m-0 overflow-x-hidden font-sans text-white cursor-default bg-body scrollbar-hide'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
