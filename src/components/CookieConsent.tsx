import classNames from 'classnames'
import { useEffect, useState } from 'react'

import { DocURL } from 'types/enums/docURL'

import { Button } from './Button'

export const CookieConsent = () => {
  const [cookieConsent, setCookieConsent] = useState<boolean>(true)

  const createCookie = () => {
    setCookieConsent(true)
    document.cookie = 'viewed_cookie_policy=yes; path=/'
  }

  useEffect(() => {
    setCookieConsent(!!document.cookie.match(new RegExp('(^| )viewed_cookie_policy=([^;]+)')))
  }, [])

  return cookieConsent ? null : (
    <section
      className={classNames(
        'fixed bottom-0 left-0 z-50 flex w-full  bg-black/90 p-4',
        'md:bg-black/70',
      )}
    >
      <div
        className={classNames(
          'mx-auto my-0  flex max-w-screen-xl flex-wrap items-center justify-center gap-4',
          'md:flex-nowrap',
        )}
      >
        <p className='basis-full text-sm'>
          This website uses cookies to improve its functionality and optimize content delivery. By
          using this website, you agree to the use of cookies for these purposes. Learn more,
          including how to modify your cookie settings, in Marsprotocol.io&apos;s{' '}
          <a
            href={DocURL.PRIVACY_POLICY_URL}
            target='_blank'
            rel='nofollow noreferrer'
            title='Privacy Policy'
          >
            privacy
          </a>{' '}
          and{' '}
          <a
            href={DocURL.COOKIE_POLICY_URL}
            target='_blank'
            rel='nofollow noreferrer'
            title='Cookie Policy'
          >
            cookie
          </a>{' '}
          policies.
        </p>
        <Button onClick={createCookie} text='Understood' />
      </div>
    </section>
  )
}
