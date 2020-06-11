import { EsNode } from '../base'
import { EsAssignmentOperator } from '../../operators'
import { EsIdentifier } from '../common'
import { EsExpression } from './base'
import { EsNodeList } from '../node-list'
import { EsFunctionParameter, EsFunctionParameterStructure } from '../function-parameter'
import { EsStatement } from '../statements'
import { indent } from '../../utils'
import * as j from 'jupiteration'

export class EsConditionalExpression extends EsExpression {

  public constructor (
    protected condition: EsExpression,
    protected trueBranch: EsAssignmentExpression,
    protected falseBranch: EsAssignmentExpression,
  ) {
    super()
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.condition
    yield this.trueBranch
    yield this.falseBranch
  }

  print (): string {
    const condition = this.condition.print()
    const trueBranch = this.trueBranch.print()
    const falseBranch = this.falseBranch.print()
    if (condition.length > 20 || trueBranch.length > 20 || falseBranch.length > 20) {
      return `${condition}\n  ?${trueBranch}\n  ${falseBranch}`
    } else {
      return `${condition} ? ${trueBranch} : ${falseBranch}`
    }
  }

}

export interface EsArrowFunctionStructure {
  async?: boolean
  params?: Iterable<EsFunctionParameter | EsFunctionParameterStructure | string> | EsNodeList<EsFunctionParameter>
  body?: EsStatement | Iterable<EsStatement> | EsNodeList<EsStatement>
}

export class EsArrowFunction extends EsExpression {

  public static New (structure: EsArrowFunction | EsArrowFunctionStructure): EsArrowFunction {
    if (structure instanceof EsArrowFunction) return structure
    const arrowFunction = new EsArrowFunction()

    // Handle async
    arrowFunction.isAsync = structure.async ?? false

    // Handle params
    if (structure.params != null) {
      if (structure.params instanceof EsNodeList) {
        arrowFunction.parameters.copyFrom(structure.params)
      } else {
        const params = j.pipe(
          structure.params,
          j.map(param => EsFunctionParameter.New(param)),
        )
        arrowFunction.parameters.append(...params)
      }
    }

    // Handle body
    if (structure.body != null) {
      if (structure.body instanceof EsNodeList) {
        arrowFunction.body.copyFrom(structure.body)
      } else if (structure.body instanceof EsStatement) {
        arrowFunction.body.append(structure.body)
      } else {
        arrowFunction.body.append(...structure.body)
      }
    }

    return arrowFunction
  }

  protected isAsync: boolean = false

  public readonly parameters = new EsNodeList<EsFunctionParameter>(this)
  public readonly body = new EsNodeList<EsStatement>(this)

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield* this.parameters.values()
    yield* this.body.values()
  }

  public print (): string {
    const async = this.isAsync ? 'async ' : ''
    const params = this.parameters.print(item => item.print(), ', ')
    const body = this.body.isEmpty() ? null : this.body.print(item => item.print(), '\n')
    const bodyIndented = body == null ? null : indent(body, 2)
    return bodyIndented == null
      ? `${async}(${params}) => { }`
      : `${async}(${params}) => {\n${bodyIndented}\n}`
  }

  public setIsAsync (isAsync: boolean): this {
    this.isAsync = isAsync
    return this
  }

}

export class EsAssignmentExpression extends EsExpression {

  public constructor (
    protected lhs: EsLeftHandSideExpression,
    protected operator: EsAssignmentOperator,
    protected rhs: EsExpression,
  ) {
    super()
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.lhs
    yield this.rhs
  }

  public print (): string {
    return `${this.lhs.print()} ${this.operator} ${this.rhs.print()}`
  }

}

export abstract class EsLeftHandSideExpression extends EsNode {

  public abstract print (): string

}

export class EsCallExpression extends EsLeftHandSideExpression {

  public readonly args = new EsNodeList<EsExpression>(this)

  public constructor (
    protected expression: EsMemberExpression,
  ) {
    super()
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.expression
    yield* this.args.values()
  }

  public print (): string {
    const args = this.args.print(arg => arg.print(), '\, ')
    return `${this.expression.print()}(${args})`
  }

}

export abstract class EsMemberExpression extends EsNode {

  protected withNew: boolean = false

  public abstract print (): string

}

export class EsPropertyAccessExpression extends EsMemberExpression {

  protected isOptional: boolean = false

  public constructor (
    protected expresion: EsMemberExpression,
    protected identifier: EsIdentifier,
  ) {
    super()
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.expresion
    yield this.identifier
  }

  public print (): string {
    const opt = this.isOptional ? '?' : ''
    return `${this.expresion.print()}${opt}.${this.identifier}`
  }

  public setIsOptional (isOptional: boolean): this {
    this.isOptional = isOptional
    return this
  }

}

export class EsElementAccessExpression extends EsMemberExpression {

  protected isOptional: boolean = false

  public constructor (
    protected expression: EsMemberExpression,
    protected argumentExpression: EsExpression,
  ) {
    super()
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.expression
    yield this.argumentExpression
  }

  public print (): string {
    const opt = this.isOptional ? '?.' : ''
    return `${this.expression.print()}[${this.argumentExpression.print()}]`
  }

  public setIsOptional (isOptional: boolean): this {
    this.isOptional = isOptional
    return this
  }

}
