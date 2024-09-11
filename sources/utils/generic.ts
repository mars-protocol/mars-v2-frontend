import { DEPOSIT_CAP_BUFFER } from './constants'

export function getCapLeftWithBuffer(cap: DepositCap) {
  return cap.max.minus(cap.used).times(DEPOSIT_CAP_BUFFER).integerValue()
}
