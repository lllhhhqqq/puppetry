import { buildAssertionTpl } from "service/assert";
import { AssertScreenshot } from "../../Assert/AssertScreenshot";
import { isEveryValueNull, isSomeValueNull, ruleValidateGenericString } from "service/utils";
import { truncate } from "service/utils";
import { getCounter } from "service/screenshotCounter";
import ExpressionParser from "service/ExpressionParser";
import { hexToRgb, rgbToHex } from "service/color";
import { INPUT_NUMBER, INPUT, CHECKBOX } from "../../constants";

export const assertScreenshot = {
  template: ( command ) => {
    const { name, fullPage, omitBackground, x, y, width, height } = command.params,
          parser = new ExpressionParser( command.id ),
          clip = {
            x,
            y,
            width,
            height
          },
          baseOptions = {
            fullPage,
            omitBackground
          },
          isClipEmpty = isEveryValueNull( clip ),
          screenshotOptions = isClipEmpty ? baseOptions : { ...baseOptions, clip },
          pixelmatchOptions = {
              includeAA: command.params.includeAA,
              diffColor: hexToRgb( command.params.diffColor ),
              aaColor: hexToRgb( command.params.aaColor ),
              threshold: command.assert.mismatchTolerance
          },
          paramName = `"${ command.id }." + ${ parser.stringify( name ) }`,
          paramScreenshotOpts = JSON.stringify( screenshotOptions, null, 2 ),
          paramPixelmatchOpts = JSON.stringify( pixelmatchOptions, null, 2 );

    return buildAssertionTpl(
      `await bs.assertScreenshot( ${ paramName }, ${ paramScreenshotOpts }, ${ paramPixelmatchOpts } )`,
      command,
      `// Asserts that screenshot of the page matches earlier made one`
    );
  },

  toLabel: ({ params }) => `(\`${ truncate( params.name, 80 ) }\`)`,
  toText: ({ params }) => `(\`${ params.name }\`)`,
  commonly: "assert page screenshot",


  validate: ( values ) => {

    const { diffColor, aaColor, x, y, width, height } = values.params;
    if ( diffColor.trim().length !== 7 || !diffColor.startsWith( "#" ) ) {
      return "Invalid diff color";
    }
    if ( aaColor.trim().length !== 7 || !aaColor.startsWith( "#" ) ) {
      return "Invalid anti-alias color";
    }

    if ( x !== null || y !== null || width !== null || height !== null ) {
      if ( x === null || y === null || width === null || height === null ) {
        return "You have to provide either all clip parameters or none";
      }
    }

    return null;
  },

  description: `Asserts that screenshot of the page matches the original.

  This method is meant for CSS regression testing where we compare visual differences on given targets.
  `,
  assert: {
    node: AssertScreenshot
  },
  params: [

    {

      legend: "",
      tooltip: "",
      fields: [
        {
          name: "params.name",
          template: true,
          control: INPUT,
          label: "Description",
          tooltip: `The description is a plain text, which will be normalized to screenshot file name.
              Slashes can be used to set file location: 'foo/bar/baz'.`,
          placeholder: "e.g. The form is just submitted",
          initialValue: ( record ) => `Page ${ getCounter( record.id ) || "" }`,
          rules: [{
            required: true,
            message: "Screenshot description required"
          },
          {
            validator: ruleValidateGenericString
          },
          {
            transform: ( value ) => value.trim()
          }]
        },
        {
          name: "params.fullPage",
          label: "fullpage",
          control: CHECKBOX ,
          tooltip: `When true, takes a screenshot of the full scrollable page.`,
          initialValue: false,
          placeholder: "",
          rules: []
        },
        {
          name: "params.omitBackground",
          label: "omit background",
          control: CHECKBOX ,
          tooltip: `Hides default white background and allows capturing screenshots with transparency.`,
          initialValue: false,
          placeholder: "",
          rules: []
        }
      ]
    },

    {
      span: { label: 4, input: 18 },
      description: "",
      tooltip: "",
      collapsed: true,


      fields: [
        {
          name: "params.x",
          control: INPUT_NUMBER,
          label: "x (px)",
          initialValue: null
        },
        {
          name: "params.y",
          control: INPUT_NUMBER,
          label: "y (px)",
          initialValue: null
        },
        {
          name: "params.width",
          control: INPUT_NUMBER,
          label: "width (px)",
          initialValue: null
        },
        {
          name: "params.height",
          control: INPUT_NUMBER,
          label: "height (px)",
          initialValue: null
        },
        {
          name: "params.includeAA",
          label: "Include anti-aliased pixels",
          control: CHECKBOX ,
          tooltip: `If true, disables detecting and ignoring anti-aliased pixels`,
          initialValue: true
        },
        {
          name: "params.diffColor",
          control: INPUT,
          label: "Diff color (HEX)",
          initialValue: "#FF0000",
          tooltip: `The color of differing pixels in the diff output`,
          placeholder: "",
          rules: [{
            required: true,
            message: `Field is required.`,
            transform: ( val ) => val.trim()
          }]
        },
        {
          name: "params.aaColor",
          control: INPUT,
          label: "Anti-alias color (HEX)",
          initialValue: "#FFFF00",
          tooltip: `The color of anti-aliased pixels in the diff output`,
          placeholder: "",
          rules: [{
            required: true,
            message: `Field is required.`,
            transform: ( val ) => val.trim()
          }]
        }
      ]
    }

  ]
};
