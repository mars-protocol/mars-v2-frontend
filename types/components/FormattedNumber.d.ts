interface FormattedNumberProps {
  amount: number | string
  animate?: boolean
  className?: string
  minDecimals?: number
  maxDecimals?: number
  thousandSeparator?: boolean
  prefix?: boolean | string
  suffix?: boolean | string
  rounded?: boolean
  abbreviated?: boolean
}
