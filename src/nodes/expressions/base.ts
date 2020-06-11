import { EsNode } from '../base'

export abstract class EsExpression extends EsNode {

  public abstract print (): string

}
