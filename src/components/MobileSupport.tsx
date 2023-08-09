import FullOverlayContent from 'components/FullOverlayContent'
import Text from 'components/Text'

export default function MobileSupport() {
  return (
    <FullOverlayContent
      className='relative mx-auto'
      title='Mobile not supported!'
      copy={`Mars v2.0 doesn't support mobile devices yet. Please come back later or use a desktop browser.`}
      button={{
        className: 'w-full mt-8',
        text: 'Go to Mars v1.0',
        color: 'tertiary',
        onClick: () => window.open('https://app.marsprotocol.io', '_self'),
        size: 'lg',
      }}
    >
      <Text>
        If you can&apos;t wait to use the Mars Protocol, you can access Mars v1.0 as it comes with
        mobile support
      </Text>
    </FullOverlayContent>
  )
}
