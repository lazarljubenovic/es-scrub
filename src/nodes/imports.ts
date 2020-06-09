import * as tg from 'type-guards'
import * as j from 'jupiteration'
import { EsIdentifier, EsStringLiteral } from './common'
import { EsNode } from './base'
import { EsNodeList } from './node-list'
import { EsModuleItem } from './module-item'

export abstract class EsImportDeclaration extends EsModuleItem {

  protected constructor (
    protected moduleSpecifier: EsStringLiteral,
  ) {
    super()
  }

  public getModuleSpecifierNode (): EsStringLiteral {
    return this.moduleSpecifier
  }

  public getModuleSpecifier (): string {
    return this.getModuleSpecifierNode().getValue()
  }

  public abstract print (): string

}

/**
 * @example
 * import foo, { bar as baz } from 'foo'
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 *
 * @example
 * import * as foo from 'foo'
 * ~~~~~~~~~~~~~~~~~~~~~~~~~~
 */
export class EsImportSymbolsDeclaration extends EsImportDeclaration {

  protected bindings: EsNodeList<EsImportBinding>

  public constructor (
    bindings: Iterable<EsImportBinding>,
    moduleSpecifier: EsStringLiteral,
  ) {
    super(moduleSpecifier)
    this.bindings = new EsNodeList<EsImportBinding>(this)
    this.bindings.append(...bindings)
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield* this.bindings.values()
    yield this.moduleSpecifier
  }

  public print (): string {
    const namedBindings = j.pipe(this.getNamedBindings(), j.map(node => node.print()), j.e.joinAsString(', '))
    const otherBindings = j.pipe(
      j.s.concat(this.getNameSpaceBindings(), this.getDefaultBindings()),
      j.map(node => node.print()),
      j.e.joinAsString(', '),
    )
    const bindingsPrinted = `${otherBindings}, { ${namedBindings} }`
    return `import ${bindingsPrinted} from ${this.moduleSpecifier.print()}`
  }

  public getNameSpaceBindings (): Iterable<EsImportedNameSpaceBinding> {
    return j.pipe(
      this.bindings.values(),
      j.filter(tg.isInstanceOf(EsImportedNameSpaceBinding)),
    )
  }

  public getDefaultBindings (): Iterable<EsImportedDefaultBinding> {
    return j.pipe(
      this.bindings.values(),
      j.filter(tg.isInstanceOf(EsImportedDefaultBinding)),
    )
  }

  public getNamedBindings (): Iterable<EsImportedNamedBinding> {
    return j.pipe(
      this.bindings.values(),
      j.filter(tg.isInstanceOf(EsImportedNamedBinding)),
    )
  }

}

export abstract class EsImportBinding extends EsNode {

  protected constructor (
    protected localName: EsIdentifier,
  ) {
    super()
  }

  public abstract print (): string

}

/**
 * @example
 * import * as foo from 'foo'
 *        ~~~~~~~~
 */
export class EsImportedNameSpaceBinding extends EsImportBinding {

  public constructor (
    localName: EsIdentifier,
  ) {
    super(localName)
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.localName
  }

  public print (): string {
    return `* as ${this.localName.print()}`
  }

}

/**
 * @example
 * import foo, { bar as baz } from 'foo'
 *        ~~~
 */
export class EsImportedDefaultBinding extends EsImportBinding {

  public constructor (
    localName: EsIdentifier,
  ) {
    super(localName)
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.localName
  }

  public print (): string {
    return this.localName.print()
  }

}

/**
 * @example
 * import { xyz, foo as bar, baz as qux } from 'foo'
 *               ~~~~~~~~~~  ~~~~~~~~~~
 */
export class EsImportedNamedBinding extends EsImportBinding {

  public constructor (
    protected externalName: EsIdentifier,
    localName: EsIdentifier,
  ) {
    super(localName)
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.externalName
    yield this.localName
  }

  public print (): string {
    if (EsIdentifier.Eq(this.externalName, this.localName)) {
      return this.localName.print()
    } else {
      return `${this.externalName.print()} as ${this.localName.print()}`
    }
  }

}


/**
 * @example
 * import 'foo'
 * ~~~~~~~~~~~~
 */
export class EsImportModuleDeclaration extends EsImportDeclaration {

  public constructor (
    moduleSpecifier: EsStringLiteral,
  ) {
    super(moduleSpecifier)
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.moduleSpecifier
  }

  public print (): string {
    return `import ${this.moduleSpecifier.print()}`
  }

}
