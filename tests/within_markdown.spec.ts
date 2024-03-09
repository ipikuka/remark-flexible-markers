import dedent from "dedent";

import { process } from "./util/index";

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

      Here are *==italic marked==* and **==bold marked==**

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
      <p>Here are <em><mark class="flexible-marker flexible-marker-default">italic marked</mark></em> and <strong><mark class="flexible-marker flexible-marker-default">bold marked</mark></strong></p>
      <blockquote>
        <p>Here is <mark class="flexible-marker flexible-marker-default">marked</mark> in blockquote</p>
      </blockquote>
      "
    `);
  });

  // ******************************************
  it("works if it contains other phrasing contents like **strong**", async () => {
    const input = dedent`
      foo==**a==b**==bar

      foo ==**a==b**== bar

      ==foo **a==b** bar==
    `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <p>foo<mark class="flexible-marker flexible-marker-default"><strong>a==b</strong></mark>bar</p>
      <p>foo <mark class="flexible-marker flexible-marker-default"><strong>a==b</strong></mark> bar</p>
      <p><mark class="flexible-marker flexible-marker-default">foo <strong>a==b</strong> bar</mark></p>
      "
    `);
  });

  // ******************************************
  it("marker works if contains other phrasing contents", async () => {
    const input = dedent`
      open==**strong ==_italik marker_== marker**==close

      ==open**strong ==_italik marker_== marker**close==
    `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "
      <p>open<mark class="flexible-marker flexible-marker-default"><strong>strong <mark class="flexible-marker flexible-marker-default"><em>italik marker</em></mark> marker</strong></mark>close</p>
      <p><mark class="flexible-marker flexible-marker-default">open<strong>strong <mark class="flexible-marker flexible-marker-default"><em>italik marker</em></mark> marker</strong>close</mark></p>
      "
    `);
  });
});
