import { EsNode } from './base'

export class EsNodeList<TNode extends EsNode> {

  protected nodes: Array<TNode> = []

  public constructor (
    protected readonly actualParent: EsNode,
  ) { }

  public isEmpty (): boolean {
    return this.nodes.length == 0
  }

  public getSize (): number {
    return this.nodes.length
  }

  public append (...newNodes: ReadonlyArray<TNode>): this {
    newNodes.forEach(newNode => newNode.assertParentNull())
    newNodes.forEach(newNode => newNode.setParent(this.actualParent))
    this.nodes.push(...newNodes)
    return this
  }

  public prepend (...newNodes: ReadonlyArray<TNode>): this {
    newNodes.forEach(newNode => newNode.assertParentNull())
    newNodes.forEach(newNode => newNode.setParent(this.actualParent))
    this.nodes.unshift(...newNodes)
    return this
  }

  public insertAt (newNode: TNode, index: number): this {
    const min = 0
    const max = this.nodes.length
    if (index < min || index > max) throw new Error(`Index ${index} is out of bounds [${min}, ${max}].`)
    newNode.setParent(this.actualParent)
    this.nodes.splice(index, 0, newNode)
    return this
  }

  public findIndex (findNode: (node: TNode) => boolean): number {
    return this.nodes.findIndex(findNode)
  }

  public insertAfter (newNode: TNode, findNode: (node: TNode) => boolean): this {
    const index = this.findIndex(findNode)
    this.insertAt(newNode, index + 1)
    return this
  }

  public insertBefore (newNode: TNode, findNode: (node: TNode) => boolean): this {
    const index = this.findIndex(findNode)
    this.insertAt(newNode, index)
    return this
  }

  public values (): IterableIterator<TNode> {
    const that = this
    let currentIndex: number = 0
    const toYield = { done: false, value: null } as IteratorResult<TNode | null>
    return {
      [Symbol.iterator] () {
        return this
      },
      next () {
        if (currentIndex >= that.nodes.length) {
          toYield.done = true
          toYield.value = null
          return toYield as { done: true, value: null }
        } else {
          toYield.value = that.nodes[currentIndex]
          currentIndex++
          return toYield as { done: false, value: TNode }
        }
      },
    }
  }

  public print (
    printItem: (item: TNode) => string,
    separator: string,
  ): string {
    return Array.from(this.values()).map(printItem).join(separator)
  }

}
