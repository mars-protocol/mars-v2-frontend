import { useLocation } from 'react-router-dom'
import { Helmet } from 'react-helmet'
import { useMemo } from 'react'

import PAGE_METADATA from 'constants/pageMetadata'

function PageMetadata() {
  const location = useLocation()

  const metadata = useMemo(() => {
    const route = location.pathname.split('/').reverse()[0] as keyof typeof PAGE_METADATA
    return PAGE_METADATA[route] || PAGE_METADATA['trade']
  }, [location])

  return (
    <Helmet>
      <title>{metadata.title}</title>
      <meta content={metadata.title} property='og:title' />
      <meta name='description' content={metadata.description} property='og:description' />
      <meta name='keywords' content={metadata.keywords} property='og:keywords' />
    </Helmet>
  )
}

export default PageMetadata
