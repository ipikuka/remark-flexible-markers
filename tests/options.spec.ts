import { unified } from "unified";
import remarkParse from "remark-parse";
import gfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import dedent from "dedent";
import type { VFileCompatible } from "vfile";

import plugin from "../src";

const compiler = unified()
  .use(remarkParse)
  .use(gfm)
  .use(plugin, {
    dictionary: {
      b: "brother",
    },
    markerClassName: "custom-marker",
    markerTagName: "span",
    markerProperties(color) {
      return {
        ["data-color"]: color,
      };
    },
    doubleEqualityCheck: "=:=",
  })
  .use(remarkRehype)
  .use(rehypeStringify);

const process = async (contents: VFileCompatible): Promise<VFileCompatible> => {
  return compiler.process(contents).then((file) => file.value);
};

describe("with options - fail", () => {
  // ******************************************
  it("bad usage", async () => {
    const input = dedent`
      =ab=marked text with more than one classification==

      ==marked text with bad wrapped=

      =marked text with bad wrapped==

      ==**strong text in marker, instead of marked text in strong**==

      ==Google is [here](https://www.google.com) available==
    `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p>=ab=marked text with more than one classification==</p>
      <p>==marked text with bad wrapped=</p>
      <p>=marked text with bad wrapped==</p>
      <p>==<strong>strong text in marker, instead of marked text in strong</strong>==</p>
      <p>==Google is <a href="https://www.google.com">here</a> available==</p>"
    `);
  });
});

describe("with options - success", () => {
  // ******************************************
  it("empty markers", async () => {
    const input = dedent(`
      ====

      ==  ==

      Here **empty** ==== marker within a content
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p><span class="custom-marker custom-marker-empty"></span></p>
      <p><span class="custom-marker custom-marker-empty"></span></p>
      <p>Here <strong>empty</strong> <span class="custom-marker custom-marker-empty"></span> marker within a content</p>"
    `);
  });

  // ******************************************
  it("standart usage", async () => {
    const input = dedent(`
      ==default marked== ==  another default marked  == 

      =r=red marked== =b=  blue marked  == 
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p><span class="custom-marker custom-marker-default">default marked</span> <span class="custom-marker custom-marker-default">another default marked</span></p>
      <p><span class="custom-marker custom-marker-red" data-color="red">red marked</span> <span class="custom-marker custom-marker-brother" data-color="brother">blue marked</span></p>"
    `);
  });

  // ******************************************
  it("marked text in a strong", async () => {
    const input = dedent(`      
        **==bold marked==**

        Here **=r=bold marked==**

        **==bold marked==** is here

        **strong =b=bold marked==**
      `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p><strong><span class="custom-marker custom-marker-default">bold marked</span></strong></p>
      <p>Here <strong><span class="custom-marker custom-marker-red" data-color="red">bold marked</span></strong></p>
      <p><strong><span class="custom-marker custom-marker-default">bold marked</span></strong> is here</p>
      <p><strong>strong <span class="custom-marker custom-marker-brother" data-color="brother">bold marked</span></strong></p>"
    `);
  });

  // ******************************************
  it("standart usage with extra content", async () => {
    const input = dedent(`      
      =r=red marked== with extra content =b=  blue marked  == 

      ==default marked== **with extra boldcontent** ==  another default marked    == 
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p><span class="custom-marker custom-marker-red" data-color="red">red marked</span> with extra content <span class="custom-marker custom-marker-brother" data-color="brother">blue marked</span></p>
      <p><span class="custom-marker custom-marker-default">default marked</span> <strong>with extra boldcontent</strong> <span class="custom-marker custom-marker-default">another default marked</span></p>"
    `);
  });

  // ******************************************
  it("example in README", async () => {
    const input = dedent(`      
      Here is ==marked content==

      Here is =r=marked content with red classification==
      
      Here is **==bold and marked content==**
      
      ### Heading with ==marked content==
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p>Here is <span class="custom-marker custom-marker-default">marked content</span></p>
      <p>Here is <span class="custom-marker custom-marker-red" data-color="red">marked content with red classification</span></p>
      <p>Here is <strong><span class="custom-marker custom-marker-default">bold and marked content</span></strong></p>
      <h3>Heading with <span class="custom-marker custom-marker-default">marked content</span></h3>"
    `);
  });

  it("with two double equality expressions in a text node and handle it via doubleEqualityCheck option", async () => {
    const input = dedent`
      If a == b and c == d, then the theorem is true.

      If a =:= b and c =:= d, then the theorem is true.
    `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p>If a <span class="custom-marker custom-marker-default">b and c</span> d, then the theorem is true.</p>
      <p>If a == b and c == d, then the theorem is true.</p>"
    `);
  });
});
