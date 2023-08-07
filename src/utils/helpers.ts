import BigNumber from 'bignumber.js'
import throttle from 'lodash.throttle'

BigNumber.config({ EXPONENTIAL_AT: 1e9 })
export function BN(n: BigNumber.Value) {
  return new BigNumber(n)
}

export function getApproximateHourlyInterest(amount: string, borrowRate: number) {
  return BigNumber(borrowRate)
    .dividedBy(24 * 365)
    .multipliedBy(amount)
}

export function asyncThrottle<F extends (...args: any[]) => Promise<any>>(func: F, wait?: number) {
  const throttled = throttle((resolve, reject, args: Parameters<F>) => {
    func(...args)
      .then(resolve)
      .catch(reject)
  }, wait)
  return (...args: Parameters<F>): ReturnType<F> =>
    new Promise((resolve, reject) => {
      throttled(resolve, reject, args)
    }) as ReturnType<F>
}
