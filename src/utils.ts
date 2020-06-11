export function stringOrZeroArgFn (x: string | (() => string)): string {
  return typeof x == 'string' ? x : x()
}

export function assertNull (value: any, message: string | (() => string)): asserts value is null {
  if (value !== null) throw new Error(stringOrZeroArgFn(message))
}

export function assertNotNull<T> (value: T | null, message: string | (() => string)): asserts value is Exclude<T, null> {
  if (value === null) throw new Error(stringOrZeroArgFn(message))
}

export function repeatString (char: string, count: number): string {
  let string = ''
  for (let i = 0; i < count; i++) string += char
  return string
}

export function indent (string: string, by: number) {
  const prefix = repeatString(' ', by)
  return string
    .split('\n')
    .map(line => line.length == 0 ? line : prefix + line)
    .join('\n')
}

export function equiv (a: boolean, b: boolean) {
  return (a && b) || (!a && !b)
}

export function isIterable (arg: unknown): arg is Iterable<unknown> {
  return arg != null && typeof arg == 'object' && Symbol.iterator in (arg as any)
}
