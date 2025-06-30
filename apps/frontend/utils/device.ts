export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  const userAgent = window.navigator.userAgent.toLowerCase()

  // モバイルデバイスのユーザーエージェントをチェック
  const mobileKeywords = [
    'android',
    'webos',
    'iphone',
    'ipad',
    'ipod',
    'blackberry',
    'iemobile',
    'opera mini',
    'mobile',
    'tablet',
  ]

  const isMobile = mobileKeywords.some((keyword) => userAgent.includes(keyword))

  // タッチデバイスのチェック
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // 画面幅でもチェック（768px以下をモバイルとみなす）
  const isSmallScreen = window.innerWidth <= 768

  return isMobile || (hasTouch && isSmallScreen)
}

export const isSafariMobile = (): boolean => {
  if (typeof window === 'undefined') {
    return false
  }

  const userAgent = window.navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipod|ipad/.test(userAgent)
  const isSafari = /safari/.test(userAgent) && !/chrome/.test(userAgent)

  return isIOS && isSafari
}
