import { EsLeafNode } from './base'
import { Unicode } from '../unicode'

export class EsStringLiteral extends EsLeafNode {

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

  public getValue (): string {
    return this.value
  }

  // TODO: Handle escaping
  public print (): string {
    return `'${this.value}'`
  }

}

export interface EsIdentifierOptions {
  handleInvalid?: 'ignore' | 'throw' | 'return-null'
}

export class EsIdentifier extends EsLeafNode {

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

  public getName () {
    return this.name
  }

  public print (): string {
    return this.name
  }

}
