import { useMemo } from 'react'
import { Helmet, HelmetProvider } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

import PAGE_METADATA from 'constants/pageMetadata'

const helmetContext = {}

function PageMetadata() {
  const location = useLocation()

  const metadata = useMemo(() => {
    const route = location.pathname.split('/').reverse()[0] as keyof typeof PAGE_METADATA
    return PAGE_METADATA[route] || PAGE_METADATA['trade']
  }, [location])

  return (
    <HelmetProvider context={helmetContext}>
      <Helmet>
        <title>{metadata.title}</title>
        <meta content={metadata.title} property='og:title' />
        <meta name='description' content={metadata.description} property='og:description' />
        <meta name='keywords' content={metadata.keywords} property='og:keywords' />
        <meta charSet='utf-8' />
        <link href='/favicon.svg' rel='icon' />
        <link href='/apple-touch-icon.png' rel='apple-touch-icon' sizes='180x180' />
        <link href='/site.webmanifest' rel='manifest' />
        <link color='#dd5b65' href='/safari-pinned-tab.svg' rel='mask-icon' />
        <meta content='index,follow' name='robots' />
        <meta content='summary_large_image' name='twitter:card' />
        <meta content='Mars Protocol' name='twitter:title' />
        <meta content='@mars_protocol' name='twitter:site' />
        <meta content='@mars_protocol' name='twitter:creator' />
        <meta content='https://app.marsprotocol.io' property='og:url' />
        <meta content='https://app.marsprotocol.io/banner.jpg' property='og:image' />
        <meta content='Mars Protocol' property='og:site_name' />
        <meta content='#ffffff' name='msapplication-TileColor' />
        <meta content='#ffffff' name='theme-color' />
        <meta
          name='viewport'
          content='width=device-width,initial-scale=1.0,maximum-scale=1.0,minimum-scale=1.0'
        />
      </Helmet>
    </HelmetProvider>
  )
}

export default PageMetadata
