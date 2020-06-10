import { EsDeclaration } from './base'
import { EsIdentifier, EsStringLiteral } from '../common'
import { OverwriteOpts } from '../../options.types'
import { assertNull, indent } from '../../utils'
import { EsNode } from '../base'
import { EsExportKind } from '../enums'
import { EsNodeList } from '../node-list'
import * as j from 'jupiteration'
import { EsStatement } from '../statements/base'
import { EsFunctionParameter, EsFunctionParameterStructure } from '../function-parameter'

export interface EsClassStructure {
  name?: EsIdentifier | string | null
  exported?: EsExportKind | boolean | null
  heritage?: string | Iterable<EsIdentifier | string> | EsNodeList<EsIdentifier>
  methods?: Iterable<EsClassMethod | EsClassMethodStructure> | EsNodeList<EsClassMethod>
}

export class EsClass extends EsDeclaration {

  public static New (structure: EsClassStructure): EsClass {
    const esClass = new EsClass()

    // Handle name
    if (structure.name != null) {
      esClass.name = EsIdentifier.New(structure.name)
    }

    // Handle export
    if (typeof structure.exported == 'boolean') {
      esClass.exported = structure.exported ? EsExportKind.Named : EsExportKind.None
    } else if (structure.exported != null) {
      esClass.exported = structure.exported
    }

    // Handle heritage
    if (structure.heritage != null) {
      if (structure.heritage instanceof EsNodeList) {
        esClass.heritage.copyFrom(structure.heritage)
      } else if (typeof structure.heritage == 'string') {
        esClass.heritage.append(EsIdentifier.New(structure.heritage))
      } else {
        const identifiers = j.pipe(
          structure.heritage,
          j.map(identifier => EsIdentifier.New(identifier)),
        )
        esClass.heritage.append(...identifiers)
      }
    }

    // Handle methods
    if (structure.methods != null) {
      if (structure.methods instanceof EsNodeList) {
        esClass.methods.copyFrom(structure.methods)
      } else {
        const methods = j.pipe(
          structure.methods,
          j.map(method => EsClassMethod.New(method)),
        )
        esClass.methods.append(...methods)
      }
    }

    return esClass
  }

  protected name: EsIdentifier | null = null
  protected exported: EsExportKind = EsExportKind.None
  public readonly heritage = new EsNodeList<EsIdentifier>(this)
  public readonly methods = new EsNodeList<EsClassMethod>(this)

  public* getNodeChildren (): IterableIterator<EsNode> {
    if (this.name != null) yield this.name
    // TODO heritage, body
  }

  public print (): string {
    const head: string = this.printHead()
    const heritage: string | null = this.printHeritage()
    const body: string | null = this.methods.isEmpty() ? null : this.methods.print(item => item.print(), '\n\n')
    const bodyIndented = body == null ? null : indent(body, 2)

    let result: string = head
    if (heritage != null) {
      result += ' ' + heritage
    }
    if (bodyIndented == null) {
      result += ' { }'
    } else {
      result += ' {\n\n' + bodyIndented + '\n\n}'
    }
    return result
  }

  protected printHead (): string {
    if (this.exported == EsExportKind.None) {
      if (this.name == null) throw new Error(`A class which is not exported as a default symbol must have a name.`)
      return `class ${this.name.getName()}`
    } else if (this.exported == EsExportKind.Named) {
      if (this.name == null) throw new Error(`A class which is not exported as a default symbol must have a name.`)
      return `export class ${this.name.getName()}`
    } else if (this.exported == EsExportKind.Default) {
      if (this.name == null) {
        return `export default class`
      } else {
        return `export default class ${this.name.getName()}`
      }
    } else {
      throw new Error(`Wrong type for exported.`)
    }
  }

  protected printHeritage (): string | null {
    if (this.heritage.isEmpty()) return null
    return `extends ${this.heritage.print(item => item.print(), ', ')}`
  }

  public setName (name: EsIdentifier, { overwrite = false }: OverwriteOpts = {}): this {
    if (!overwrite) assertNull(this.name, () => `Cannot set name to ”${name.getName()}“, because name “${this.name!.getName()}” is already assigned. Consider passing { overwrite: true } as the second argument.`)
    this.name = name
    return this
  }

  public setIsExported (exported: EsExportKind): this {
    this.exported = exported
    return this
  }

}

export interface EsClassMethodStructure {
  name: EsIdentifier | EsStringLiteral | string
  parameters?: Iterable<EsFunctionParameter | EsFunctionParameterStructure | string> | EsNodeList<EsFunctionParameter>
}

export class EsClassMethod extends EsNode {

  public static New (structure: EsClassMethod | EsClassMethodStructure): EsClassMethod {
    if (structure instanceof this) {
      return structure
    }

    // Handle name
    let name: EsIdentifier | EsStringLiteral
    if (structure.name instanceof EsIdentifier || structure.name instanceof EsStringLiteral) {
      name = structure.name
    } else {
      const esIdentifierOrNull = EsIdentifier.New(structure.name, { handleInvalid: 'return-null' })
      if (esIdentifierOrNull != null) {
        name = esIdentifierOrNull
      } else {
        name = EsStringLiteral.New(structure.name)
      }
    }
    const esClassMethod = new EsClassMethod(name)

    // Handle parameters
    if (structure.parameters != null) {
      if (structure.parameters instanceof EsNodeList) {
        esClassMethod.parameters.copyFrom(structure.parameters)
      } else {
        const normalized = j.pipe(
          structure.parameters,
          j.map(parameter => EsFunctionParameter.New(parameter)),
        )
        esClassMethod.parameters.append(...normalized)
      }
    }

    return esClassMethod
  }

  protected name: EsIdentifier | EsStringLiteral
  public readonly parameters = new EsNodeList<EsFunctionParameter>(this)
  public readonly body = new EsNodeList<EsStatement | EsDeclaration>(this)

  public constructor (
    name: EsIdentifier | EsStringLiteral,
  ) {
    super()
    this.name = name
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.name
  }

  public print (): string {
    const head = `${this.name.print()} (${this.parameters.print(item => item.print(), ', ')})`
    if (this.body.isEmpty()) {
      return head + ' { }'
    } else {
      const body = this.body.print(item => item.print(), '\n')
      const indentedBody = indent(body, 2)
      return head + ` {\n${indentedBody}\n}`
    }
  }

}
