import { EsStatement } from './base'
import { EsExpression } from '../expressions'
import { EsNode } from '../base'

export class EsExpressionStatement extends EsStatement {

  public static New (structure: EsExpressionStatement | EsExpression): EsExpressionStatement {
    if (structure instanceof EsExpressionStatement) return structure
    return new EsExpressionStatement(structure)
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
    return this.expression.print()
  }

}
