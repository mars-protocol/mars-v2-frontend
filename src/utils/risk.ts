import dayjs from 'utils/dayjs'

export const createRiskData = (risk: number) => {
  const data = []
  const days = 30
  const today = new Date()

  for (let i = 0; i <= days; i++) {
    const date = dayjs(today)
      .subtract(days - i, 'days')
      .format('YYYY-MM-DD')
    data.push({
      date: date,
      risk: i === days ? risk * 100 : Math.floor(Math.random() * 100),
    })
  }

  return data
}
