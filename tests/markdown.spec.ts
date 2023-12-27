import { unified } from "unified";
import remarkParse from "remark-parse";
import gfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeFormat from "rehype-format";
import rehypeStringify from "rehype-stringify";
import dedent from "dedent";
import type { VFileCompatible } from "vfile";

import plugin from "../src";

const compiler = unified()
  .use(remarkParse)
  .use(gfm)
  .use(plugin)
  .use(remarkRehype)
  .use(rehypeFormat)
  .use(rehypeStringify);

const process = async (contents: VFileCompatible): Promise<VFileCompatible> => {
  return compiler.process(contents).then((file) => file.value);
};

describe("within a markdown content", () => {
  // ******************************************
  it("works in different markdown elements", async () => {
    const input = dedent`
      # heading with ==marked==

      + List item
      + List item with ==marked==

      |Abc|Xyz|
      |---|---|
      |normal|==marked==|

      Here are *==italic marked==* and **bold marked**

      > Here is ==marked== in blockquote
    `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <h1>heading with <mark class="flexible-marker flexible-marker-default">marked</mark></h1>
      <ul>
        <li>List item</li>
        <li>List item with <mark class="flexible-marker flexible-marker-default">marked</mark></li>
      </ul>
      <table>
        <thead>
          <tr>
            <th>Abc</th>
            <th>Xyz</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>normal</td>
            <td><mark class="flexible-marker flexible-marker-default">marked</mark></td>
          </tr>
        </tbody>
      </table>
      <p>Here are <em><mark class="flexible-marker flexible-marker-default">italic marked</mark></em> and <strong>bold marked</strong></p>
      <blockquote>
        <p>Here is <mark class="flexible-marker flexible-marker-default">marked</mark> in blockquote</p>
      </blockquote>
      "
    `);
  });

  it("with two double equality expressions in a text node", async () => {
    const input = dedent`
      If a == b and c == d, then the theorem is true.

      If a =:= b and c =:= d, then the theorem is true.
    `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <p>If a <mark class="flexible-marker flexible-marker-default">b and c</mark> d, then the theorem is true.</p>
      <p>If a =:= b and c =:= d, then the theorem is true.</p>
      "
    `);
  });
});
