import { EsStatement } from './base'
import { EsExpression } from '../expressions'
import { EsNode } from '../base'
import { EsIdentifier } from '../common'

export class EsReturnStatement extends EsStatement {

  public static New (structure: EsReturnStatement | EsExpression | EsIdentifier | string): EsReturnStatement {
    if (structure instanceof EsReturnStatement) return structure
    if (typeof structure == 'string' || structure instanceof EsIdentifier) {
      return new EsReturnStatement(EsIdentifier.New(structure))
    }
    return new EsReturnStatement(structure)
  }


  public constructor (
    protected expression: EsExpression,
  ) {
    super()
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.expression
  }

  public print (): string {
    return `return ${this.expression.print()}`
  }

}
