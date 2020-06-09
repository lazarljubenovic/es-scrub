import * as chai from 'chai'
import * as tags from 'common-tags'
import { EsModule } from './module'
import { EsImportedDefaultBinding, EsImportedNamedBinding, EsImportSymbolsDeclaration } from './imports'
import { EsIdentifier, EsStringLiteral } from './common'
import { EsClass } from './declarations/class'

describe(`Imports`, () => {

  it(`correctly prints a single import`, () => {
    const module = new EsModule()
    module.items.append(
      new EsImportSymbolsDeclaration(
        [
          new EsImportedDefaultBinding(new EsIdentifier('someModule')),
          new EsImportedNamedBinding(
            new EsIdentifier('direct'),
            new EsIdentifier('direct'),
          ),
          new EsImportedNamedBinding(
            new EsIdentifier('indi'),
            new EsIdentifier('rect'),
          ),
        ],
        new EsStringLiteral('some-module-1'),
      ),
    )
    const actual = module.print()
    const expected = tags.stripIndent`
      import someModule, { direct, indi as rect } from 'some-module-1'
    `
    chai.assert.equal(actual, expected)
  })

})

describe(`Classes`, () => {

  it(`correctly prints an empty class`, () => {
    const module = new EsModule()
    module.items.append(
      new EsClass()
        .setName(new EsIdentifier(`Foo`)),
    )
    const actual = module.print()
    const expected = tags.stripIndent`
      class Foo {
      
      }
    `
    chai.assert.equal(actual, expected)
  })

  it(`correctly prints an empty exported class`, () => {
    const module = new EsModule()
    module.items.append(
      new EsClass()
        .setName(new EsIdentifier(`Foo`))
        .setIsExported(true),
    )
    const actual = module.print()
    const expected = tags.stripIndent`
      export class Foo {
      
      }
    `
    chai.assert.equal(actual, expected)
  })

})
