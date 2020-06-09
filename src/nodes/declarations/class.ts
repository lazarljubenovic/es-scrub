import { EsDeclaration } from './base'
import { EsIdentifier, EsStringLiteral } from '../common'
import { OverwriteOpts } from '../../options.types'
import { assertNull, indent } from '../../utils'
import { EsNode } from '../base'

export class EsClass extends EsDeclaration {

  protected name: EsIdentifier | null = null
  protected isExported_: boolean = false

  public* getNodeChildren (): IterableIterator<EsNode> {
    if (this.name != null) yield this.name
    // TODO heritage, body
  }

  public print (): string {
    const head = [
      (this.isExported_ && this.name == null) ? `export default class ` : ``,
      (this.isExported_ && this.name != null) ? `export class ${this.name.getName()} ` : ``,
      (!this.isExported_ && this.name == null) ? `class Unnamed ` : ``, // TODO?
      (!this.isExported_ && this.name != null) ? `class ${this.name.getName()} ` : ``,
    ].join('')
    const body = '' // TODO
    const bodyIndented = indent(body, 2)
    return head + `{\n` + bodyIndented + '\n}'
  }

  public setName (name: EsIdentifier, { overwrite = false }: OverwriteOpts = {}): this {
    if (!overwrite) assertNull(this.name, () => `Cannot set name to ”${name.getName()}“, because name “${this.name!.getName()}” is already assigned. Consider passing { overwrite: true } as the second argument.`)
    this.name = name
    return this
  }

  public setIsExported (isExported: boolean): this {
    this.isExported_ = isExported
    return this
  }

}
