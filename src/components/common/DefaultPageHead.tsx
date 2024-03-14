import Head from 'next/head'

function DefaultPageHead() {
  return (
    <Head>
      <title>Mars Protocol V2</title>
      <meta charSet='utf-8' />
      <link href='/favicon.svg' rel='icon' />
      <link href='/apple-touch-icon.png' rel='apple-touch-icon' sizes='180x180' />
      <link href='/site.webmanifest' rel='manifest' />
      <link color='#dd5b65' href='/safari-pinned-tab.svg' rel='mask-icon' />
      <meta content='index,follow' name='robots' />
      <meta content='summary_large_image' name='twitter:card' />
      <meta content='@mars_protocol' name='twitter:site' />
      <meta content='@mars_protocol' name='twitter:creator' />
      <meta content='https://osmosis.marsprotocol.io' property='og:url' />
      <meta content='https://osmosis.marsprotocol.io/banner.png' property='og:image' />
      <meta content='Mars Protocol V2' property='og:site_name' />
      <meta content='#ffffff' name='msapplication-TileColor' />
      <meta content='#ffffff' name='theme-color' />
      <meta
        name='viewport'
        content='width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0'
      />
    </Head>
  )
}

export default DefaultPageHead
