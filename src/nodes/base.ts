import * as tg from 'type-guards'
import { IncludeSelfOpts, OverwriteOpts } from '../options.types'
import { assertNotNull, assertNull } from '../utils'

export type StrictCtor<T> = new (...args: any[]) => T
export type AbstractCtor<T> = Function & { prototype: T }
export type Ctor<T> = StrictCtor<T> | AbstractCtor<T>
export type EsNodeCtor = Ctor<EsNode>

export interface EsNodeSetParentOptions extends OverwriteOpts {
}

export interface EsNodeGetAncestorsOptions extends IncludeSelfOpts {
}

export abstract class EsNode {

  public parent: EsNode | null = null

  public getParentOrNull (): EsNode | null {
    return this.parent
  }

  public getParent (): EsNode {
    return tg.throwIf(tg.isNull)(this.parent)
  }

  public assertParentNotNull (): this {
    assertNotNull(this.parent, `Didn't expect parent to be null.`)
    return this
  }

  public assertParentNull (): this {
    assertNull(this.parent, `Expected parent to be null.`)
    return this
  }

  public getParentAndAssert<TNode extends EsNode | null> (guard: (parent: EsNode | null) => parent is TNode): TNode
  public getParentAndAssert (condition: (parent: EsNode | null) => boolean): EsNode | null
  public getParentAndAssert (condition: (parent: EsNode | null) => boolean): EsNode | null {
    if (condition(this.parent)) return this.parent
    throw new Error(`Assertion on the parent failed.`)
  }

  public getParentAndAssertType<TNode extends EsNode> (type: Ctor<TNode>): TNode {
    return this.getParentAndAssert(tg.isInstanceOf(type))
  }

  public setParent (parent: EsNode, { overwrite }: EsNodeSetParentOptions = {}): this {
    if (!overwrite) this.assertParentNull()
    this.parent = parent
    return this
  }

  public getAncestors (
    { includeSelf }: EsNodeGetAncestorsOptions = {},
  ): IterableIterator<EsNode> {
    let current: EsNode | null = includeSelf ? this : this.parent
    const toYield = { done: false, value: null } as IteratorResult<EsNode | null>
    return {
      [Symbol.iterator] () {
        return this
      },
      next () {
        if (current == null) {
          toYield.done = true
          toYield.value = null
          return toYield as { done: true, value: null }
        } else {
          toYield.value = current
          current = current.parent
          return toYield as { done: false, value: EsNode }
        }
      },
    }
  }

  public abstract getNodeChildren (): IterableIterator<EsNode>

}

export abstract class EsLeafNode extends EsNode {

  public* getNodeChildren (): IterableIterator<never> { }

}
