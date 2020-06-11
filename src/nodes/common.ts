import { EsLeafNode, EsNode } from './base'
import { Unicode } from '../unicode'
import { EsNodeList } from './node-list'
import { EsExpression } from './expressions/'
import { indent } from '../utils'

export class EsStringLiteral extends EsExpression {

  public static Eq (a: EsStringLiteral, b: EsStringLiteral): boolean {
    return a.value == b.value
  }

  public static New (stringLiteral: EsStringLiteral | string): EsStringLiteral {
    if (typeof stringLiteral == 'string') return new EsStringLiteral(stringLiteral)
    return stringLiteral
  }

  public constructor (
    protected value: string,
  ) { super() }

  public* getNodeChildren (): IterableIterator<EsNode> { }

  // TODO: Handle escaping
  public print (): string {
    return `'${this.value}'`
  }

  public getValue (): string {
    return this.value
  }

}

export interface EsNumericLiteralEqualityOptions {
  raw?: boolean
}

export class EsNumericLiteral extends EsExpression {

  public static Eq (a: EsNumericLiteral, b: EsNumericLiteral, opts: EsNumericLiteralEqualityOptions = {}): boolean {
    if (opts.raw) {
      return a.raw == b.raw
    } else {
      return a.getValue() == b.getValue()
    }
  }

  public constructor (
    protected raw: string,
  ) { super() }

  public* getNodeChildren (): IterableIterator<EsNode> { }

  public print (): string {
    return this.raw
  }

  public getValue (): number {
    return Number(this.raw)
  }

  public getRaw (): string {
    return this.raw
  }

}

export interface EsIdentifierOptions {
  handleInvalid?: 'ignore' | 'throw' | 'return-null'
}

export class EsIdentifier extends EsExpression {

  public static Eq (a: EsIdentifier, b: EsIdentifier): boolean {
    return a.name == b.name
  }

  public static New (identifier: string, options: { handleInvalid: 'return-null' }): EsIdentifier | null
  public static New (identifier: EsIdentifier | string, option?: EsIdentifierOptions): EsIdentifier
  public static New (
    identifier: EsIdentifier | string,
    options: EsIdentifierOptions = {},
  ): EsIdentifier | null {
    if (typeof identifier == 'string') {
      if (options.handleInvalid == 'ignore') {
        return new EsIdentifier(identifier)
      } else {
        const isValid = this.IsValidName(identifier)
        if (isValid) {
          return new EsIdentifier(identifier)
        } else {
          if (options.handleInvalid == 'return-null') {
            return null
          } else {
            // throw is default
            throw new Error(`Invalid EsIdentifier name “${identifier}”.`)
          }
        }
      }
    }
    return identifier
  }

  public static IsStringOrId (arg: unknown): arg is string | EsIdentifier {
    return typeof arg == 'string' || arg instanceof EsIdentifier
  }

  public static IsValidName (name: string): boolean {
    if (name != name.trim()) return false
    if (name.length == 0) return false
    const firstLetter = name.charCodeAt(0)
    if (Unicode.DigitZero <= firstLetter && firstLetter <= Unicode.DigitNine) return false
    for (let i = 0; i < name.length; i++) {
      const charCode = name.charCodeAt(i)
      if (Unicode.DigitZero <= charCode && charCode <= Unicode.DigitNine) continue
      if (Unicode.LatinCapitalLetterA <= charCode && charCode <= Unicode.LatinCapitalLetterZ) continue
      if (Unicode.LatinSmallLetterA <= charCode && charCode <= Unicode.LatinSmallLetterZ) continue
      if (charCode == Unicode.LowLine) continue
      if (charCode == Unicode.DollarSign) continue
      return false
    }
    return true
  }

  public constructor (
    protected name: string,
  ) { super() }

  public* getNodeChildren (): IterableIterator<EsNode> { }

  public print (): string {
    return this.name
  }

  public getName () {
    return this.name
  }

}

export class EsArrayLiteral extends EsExpression {

  public readonly elements = new EsNodeList<EsExpression>(this)

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield* this.elements.values()
  }

  public print (): string {
    const els = indent(this.elements.print(el => el.print(), '\n'), 2)
    return `[\n${els}\n]`
  }

}


