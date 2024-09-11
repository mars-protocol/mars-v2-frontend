import MobileDetect from 'mobile-detect'

export const isMobile = () => {
  if (typeof navigator === 'undefined') return false

  const mobileDetect = new MobileDetect(navigator.userAgent)

  return !!mobileDetect.mobile()
}

export const isAndroid = () => {
  const mobileDetect = new MobileDetect(navigator.userAgent)

  return mobileDetect.is('AndroidOS')
}

export const isIOS = () => {
  const mobileDetect = new MobileDetect(navigator.userAgent)

  return mobileDetect.is('iOS')
}
