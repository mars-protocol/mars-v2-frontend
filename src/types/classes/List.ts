export class List<T> {
  value: T[]

  constructor() {
    this.value = []
  }

  pushIfNotEmpty(value: T | null | undefined) {
    if (value) {
      this.value.push(value)
    }
  }

  isEmpty(): boolean {
    return this.value.length === 0
  }

  isNotEmpty(): boolean {
    return !this.isEmpty()
  }
}
