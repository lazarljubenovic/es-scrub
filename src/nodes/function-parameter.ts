import { EsNode } from './base'
import { EsIdentifier } from './common'

export interface EsFunctionParameterStructure {
  name: EsIdentifier | string
  spread?: boolean | null
}

export class EsFunctionParameter extends EsNode {

  public static New (structure: EsFunctionParameter | EsFunctionParameterStructure | string): EsFunctionParameter {
    if (structure instanceof this) {
      return structure
    }

    if (typeof structure == 'string') {
      const { name, isSpread } = this.ParseMicroSyntax(structure)
      return new EsFunctionParameter(EsIdentifier.New(name), isSpread)
    } else {
      if (typeof structure.name == 'string') {
        const { name, isSpread } = this.ParseMicroSyntax(structure.name)
        if (structure.spread === false && isSpread) {
          throw new Error(`The given parameter name “${structure.name}” implies that it's a spread parameter, but “spread” was explicitly specified as “false”.`)
        }
        return new EsFunctionParameter(EsIdentifier.New(name), (structure.spread ?? false) || isSpread)
      } else {
        return new EsFunctionParameter(structure.name, structure.spread ?? false)
      }
    }
  }

  /**
   * Using the {@link New} method allows passing in a string such as `...foo`, which will be
   * interpreted as a parameter named `foo` whose `isSpread` flag is on. This utility parses
   * such micro syntax.
   */
  private static ParseMicroSyntax (shorthand: string): { name: string, isSpread: boolean } {
    const THREE_PERIODS = '...'
    if (shorthand.startsWith(THREE_PERIODS)) {
      return {
        name: shorthand.slice(THREE_PERIODS.length),
        isSpread: true,
      }
    } else {
      return {
        name: shorthand,
        isSpread: false,
      }
    }
  }

  public constructor (
    protected identifier: EsIdentifier,
    protected isSpread: boolean = false,
  ) {
    super()
  }

  public* getNodeChildren (): IterableIterator<EsNode> {
    yield this.identifier
  }

  public print (): string {
    let string: string = ''
    if (this.isSpread) string += '...'
    string += this.identifier.print()
    return string
  }

}
