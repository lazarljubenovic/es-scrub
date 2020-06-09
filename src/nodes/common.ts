import { EsLeafNode } from './base'

export class EsStringLiteral extends EsLeafNode {

  public static Eq (a: EsStringLiteral, b: EsStringLiteral): boolean {
    return a.value == b.value
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

export class EsIdentifier extends EsLeafNode {

  public static Eq (a: EsIdentifier, b: EsIdentifier): boolean {
    return a.name == b.name
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
