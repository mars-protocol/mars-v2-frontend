import { HealthComputer } from 'types/generated/mars-rover-health-computer/MarsRoverHealthComputer.types'

export function findPositionInAccount(healthComputer: HealthComputer, denom: string) {
  const positions = [
    ...healthComputer.positions.debts,
    ...healthComputer.positions.deposits,
    ...healthComputer.positions.lends,
  ]
  const hasAccountPosition = positions.find((position) => position.denom === denom)
  const hasPerpPosition = healthComputer.positions.perps.find(
    (position) => position.denom === denom,
  )

  return hasAccountPosition || hasPerpPosition
}
