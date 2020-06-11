import { EsNode } from './base'
import { EsIdentifier, EsStringLiteral } from './common'
import { EsAssignmentExpressionBase } from './expressions'
import { EsNodeList } from './node-list'
import { indent } from '../utils'

export class EsObjectLiteral extends EsNode {

  public readonly properties = new EsNodeList<EsObjectLiteralProperty>(this)

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield* this.properties.values()
  }

  public print (): string {
    const body = indent(this.properties.print(prop => prop.print(), '\n'), 2)
    return `{\n${body}\n}`
  }

}

export abstract class EsObjectLiteralProperty extends EsNode {

  public abstract print (): string

}

export class EsObjectLiteralCommonProperty extends EsObjectLiteralProperty {

  public constructor (
    protected key: EsIdentifier | EsStringLiteral,
    protected value: EsAssignmentExpressionBase,
  ) {
    super()
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.key
    yield this.value
  }

  public print (): string {
    const key = this.key instanceof EsIdentifier ? this.key.print() : `[${this.key.print()}]`
    return `${key}: ${this.value.print()}`
  }

}

export class EsObjectLiteralShorthandProperty extends EsObjectLiteralProperty {

  public constructor (
    protected keyValue: EsIdentifier,
  ) {
    super()
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.keyValue
  }

  public print (): string {
    return this.keyValue.print()
  }

}

export class EsObjectLiteralSpreadProperty extends EsObjectLiteralProperty {

  public constructor (
    protected expression: EsAssignmentExpressionBase,
  ) {
    super()
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.expression
  }

}
