import { Head, Html, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html className='p-0 m-0 scrollbar-hide' lang='en'>
      <Head>
        {/* Primary Meta Tags */}
        <meta charSet='utf-8' />
        <meta name='robots' content='index,follow' />
        <meta name='theme-color' content='#ffffff' />
        <meta name='msapplication-TileColor' content='#ffffff' />

        {/* Favicon and App Icons */}
        <link rel='icon' href='/favicon.svg' />
        <link rel='apple-touch-icon' sizes='180x180' href='/apple-touch-icon.png' />
        <link rel='manifest' href='/site.webmanifest' />
        <link rel='mask-icon' href='/safari-pinned-tab.svg' color='#dd5b65' />

        {/* Open Graph / Facebook */}
        <meta property='og:type' content='website' />
        <meta property='og:url' content='https://app.marsprotocol.io' />
        <meta property='og:site_name' content='Mars Protocol' />
        <meta property='og:image' content='https://app.marsprotocol.io/banner.jpg' />
        <meta property='og:image:width' content='1200' />
        <meta property='og:image:height' content='630' />

        {/* Twitter */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:site' content='@mars_protocol' />
        <meta name='twitter:creator' content='@mars_protocol' />
        <meta name='twitter:image' content='https://app.marsprotocol.io/banner.jpg' />

        {/* Scripts */}
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
