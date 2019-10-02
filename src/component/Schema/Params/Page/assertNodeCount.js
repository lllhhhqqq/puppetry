import { INPUT } from "../../constants";
import { buildAssertionTpl } from "service/assert";
import { AssertNumber } from "../../Assert/AssertNumber";
import { OPERATOR_MAP } from "service/utils";

export const assertNodeCount = {
  template: ( command ) => buildAssertionTpl(
    `( await bs.page.$$(${ JSON.stringify( command.params.selector ) }) ).length`,
    command,
    `// Asserting that number of elements matching "${ command.params.selector }" satisfies the given constraint`
  ),

  toLabel: ({ params, assert }) =>
    `(count(\`${ params.selector }\`) ${ OPERATOR_MAP[ assert.operator ] } ${ assert.value })`,
  toText: ({ params, assert }) =>
    `(count(\`${ params.selector }\`) ${ OPERATOR_MAP[ assert.operator ] } ${ assert.value })`,
  commonly: "assert count of elements",

  assert: {
    node: AssertNumber,
    options: {
      resultLabel: "Number is"
    }
  },
  description: `Asserts that number of elements matching a specified selector satisfies the given constraint`,
  params: [
    {
      fields: [
        {
          name: "params.selector",
          control: INPUT,
          label: "Selector",
          placeholder: "e.g div",
          rules: [{
            required: true,
            message: "Enter CSS selector"
          }]
        }
      ]
    }
  ]
};
