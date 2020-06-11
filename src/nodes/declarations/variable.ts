import { EsDeclaration } from './base'
import { EsNode } from '../base'
import { EsIdentifier } from '../common'
import { EsNodeList } from '../node-list'
import { EsAssignmentExpression, EsExpression } from '../expressions'
import * as j from 'jupiteration'
import { isIterable } from '../../utils'

type OrIterable<T> = T | Iterable<T>

export type VariableDeclarationType =
  | 'let'
  | 'const'
  | 'var'

export interface EsVariableDeclarationStructure {
  type: VariableDeclarationType
  bindings: OrIterable<string | EsIdentifier | EsVariableDeclarationBinding | EsVariableDeclarationBindingStructure>
}

export class EsVariableDeclaration extends EsDeclaration {

  public static New (
    structure: EsVariableDeclaration | EsVariableDeclarationStructure,
  ): EsVariableDeclaration {
    if (structure instanceof EsVariableDeclaration) return structure
    const declaration = new EsVariableDeclaration(structure.type)
    let bindings: Iterable<EsVariableDeclarationBinding>
    if (typeof structure.bindings == 'string' || !isIterable(structure.bindings)) {
      bindings = [EsVariableDeclarationBinding.New(structure.bindings)]
    } else {
      bindings = j.pipe(
        structure.bindings,
        j.map(binding => EsVariableDeclarationBinding.New(binding)),
      )
    }
    declaration.bindings.append(...bindings)
    return declaration
  }

  public readonly bindings = new EsNodeList<EsVariableDeclarationBinding>(this)

  public constructor (
    protected type: VariableDeclarationType,
  ) {
    super()
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield* this.bindings.values()
  }

  public print (): string {
    const bindings = this.bindings.print(item => item.print(), ', ')
    return `${this.type} ${bindings}`
  }

}

export interface EsVariableDeclarationBindingStructure {
  identifier: EsIdentifier | string
  initializer: EsExpression
}

export class EsVariableDeclarationBinding extends EsNode {

  public static New (
    structure: EsVariableDeclarationBinding | EsVariableDeclarationBindingStructure | EsIdentifier | string,
  ): EsVariableDeclarationBinding {
    if (structure instanceof EsVariableDeclarationBinding) return structure
    const id = EsIdentifier.New(EsIdentifier.IsStringOrId(structure) ? structure : structure.identifier)
    const init = EsIdentifier.IsStringOrId(structure) ? null : structure.initializer
    return new EsVariableDeclarationBinding(id, init)
  }

  public constructor (
    protected identifier: EsIdentifier,
    protected initializer: EsExpression | null,
  ) {
    super()
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.identifier
    if (this.initializer != null) yield this.initializer
  }

  public print (): string {
    const id = this.identifier.print()
    if (this.initializer == null) {
      return id
    } else {
      return `${id} = ${this.initializer.print()}`
    }
  }

}
