import * as chai from 'chai'
import * as tags from 'common-tags'
import { EsModule } from './module'
import { EsImportedDefaultBinding, EsImportedNamedBinding, EsImportSymbolsDeclaration } from './imports'
import { EsIdentifier, EsStringLiteral } from './common'
import { EsClass, EsVariableDeclaration } from './declarations'
import { EsExportKind } from './enums'
import { EsExpressionStatement, EsReturnStatement } from './statements'
import { EsArrowFunction } from './expressions'

describe(`Common`, () => {

  describe(`EsIdentifier`, () => {

    describe(`IsValidName static method`, () => {

      it(`returns true for a simple string of letters`, () => {
        chai.assert.isTrue(EsIdentifier.IsValidName('AbCd'))
      })

    })

  })

})

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
      EsClass.New({ name: 'Foo' }),
    )
    const actual = module.print()
    const expected = tags.stripIndent`
      class Foo { }
    `
    chai.assert.equal(actual, expected)
  })

  it(`correctly prints an empty exported (by name) class`, () => {
    const module = new EsModule()
    module.items.append(
      EsClass.New({ name: 'Foo', exported: EsExportKind.Named }),
    )
    const actual = module.print()
    const expected = tags.stripIndent`
      export class Foo { }
    `
    chai.assert.equal(actual, expected)
  })

  it(`correctly creates a class with heritage`, () => {
    const module = new EsModule()
    const klass = EsClass.New({
      name: 'Foo',
      exported: EsExportKind.Default,
      heritage: ['This', 'And', 'That'],
    })
    module.items.append(klass)
    const actual = module.print()
    const expected = tags.stripIndent`
      export default class Foo extends This, And, That { }
    `
    chai.assert.equal(actual, expected)
  })

  it(`correctly creates a class with several empty-bodied methods`, () => {
    const module = new EsModule()
    const klass = EsClass.New({
      name: 'Foo',
      exported: EsExportKind.None,
      heritage: 'Bar',
      methods: [
        { name: 'first' },
        { name: 'second', parameters: [] },
        { name: 'third', parameters: ['a'] },
        { name: 'fourth', parameters: ['a', { name: 'b' }, { name: 'c', spread: true }] },
        { name: 'fifth', parameters: ['a', { name: '...b' }] },
      ],
    })
    module.items.append(klass)
    const actual = module.print()
    const expected = tags.stripIndent`
      class Foo extends Bar {

        first () { }
      
        second () { }

        third (a) { }

        fourth (a, b, ...c) { }

        fifth (a, ...b) { }
      
      }
    `
    chai.assert.equal(actual, expected)
  })

})

describe(`Statements`, () => {

  describe(`Variable declaration`, () => {

    it(`works for a single binding`, () => {
      const variable = EsVariableDeclaration.New({
        type: 'let',
        bindings: 'foo',
      })
      const module = EsModule.New([variable])
      const actual = module.print()
      const expected = tags.stripIndent`
        let foo
      `
      chai.assert.equal(actual, expected)
    })

    it(`works for a single binding with initializer`, () => {
      const module = EsModule.New([
        EsVariableDeclaration.New({
          type: 'const',
          bindings: { identifier: 'foo', initializer: EsStringLiteral.New('bar') },
        }),
      ])
      const actual = module.print()
      const expected = tags.stripIndent`
        const foo = 'bar'
      `
      chai.assert.equal(actual, expected)
    })

    it(`works for several bindings`, () => {
      const module = EsModule.New([
        EsVariableDeclaration.New({
          type: 'var',
          bindings: [
            'a',
            EsIdentifier.New('b'),
            { identifier: 'c', initializer: EsIdentifier.New('d') },
          ],
        }),
      ])
      const actual = module.print()
      const expected = tags.stripIndent`
        var a, b, c = d
      `
      chai.assert.equal(actual, expected)
    })

  })

  describe(`Arrow functions`, () => {

    it(`works for an empty function`, () => {
      const module = EsModule.New([
        EsExpressionStatement.New(
          EsArrowFunction.New({}),
        ),
      ])
      const actual = module.print()
      const expected = tags.stripIndent`
        () => { }
      `
      chai.assert.equal(actual, expected)
    })

    it(`works for a few arguments and a return statement`, () => {
      const module = EsModule.New([
        EsExpressionStatement.New(
          EsArrowFunction.New({
            params: ['a', 'b', '...c'],
            body: [
              EsReturnStatement.New('a'),
            ],
          }),
        ),
      ])
      const actual = module.print()
      const expected = tags.stripIndent`
        (a, b, ...c) => {
          return a
        }
      `
      chai.assert.equal(actual, expected)
    })

  })

})
