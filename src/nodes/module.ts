import { EsNode } from './base'
import { EsNodeList } from './node-list'
import { EsImportDeclaration } from './imports'
import { EsExportDeclaration } from './exports'
import { EsStatement } from './statements/base'
import { EsDeclaration } from './declarations/base'
import { EsModuleItem } from './module-item'

export class EsModule extends EsNode {

  public readonly items = new EsNodeList<EsModuleItem>(this)

  public getNodeChildren (): IterableIterator<EsNode> {
    return this.items.values()
  }

  public print (): string {

    function getType (nodeItem: EsModuleItem) {
      if (nodeItem instanceof EsImportDeclaration) return EsImportDeclaration
      if (nodeItem instanceof EsExportDeclaration) return EsExportDeclaration
      if (nodeItem instanceof EsStatement) return EsStatement
      if (nodeItem instanceof EsDeclaration) return EsDeclaration
      throw new Error(`Unexpected module item of type ${nodeItem.constructor.name}.`)
    }

    let string: string = ''

    let previousType: any = null
    let isFirst: boolean = true
    for (const item of this.items.values()) {
      const type = getType(item)
      if (previousType != type && previousType != null) string += '\n'
      previousType = type
      const prefix = isFirst ? '' : '\n'
      string += prefix + item.print()
      if (isFirst) isFirst = false
    }

    return string

  }

}
