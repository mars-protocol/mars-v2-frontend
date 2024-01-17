interface PythBarQueryData {
  s: string
  t: number[]
  o: number[]
  h: number[]
  l: number[]
  c: number[]
  v: number[]
}

interface TheGraphBarQueryData {
  close: string
  high: string
  low: string
  open: string
  timestamp: string
  volume: string
}

interface Bar {
  time: number
  open: number
  high: number
  low: number
  close: number
}

interface StreamData {
  id: string
  p: number
  t: number
  f: string
  s: number
}
