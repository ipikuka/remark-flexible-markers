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
  .use(plugin)
  .use(remarkRehype)
  .use(rehypeStringify);

const process = async (contents: VFileCompatible): Promise<VFileCompatible> => {
  return compiler.process(contents).then((file) => file.value);
};

describe("no options - fail", () => {
  // ******************************************
  it("bad usage", async () => {
    const input = dedent`
      =ab=marked text with more than one classification==

      ==marked text with bad wrapped=

      =marked text with bad wrapped==

      ==**strong text in marker, instead of marked text in strong**==
    `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p>=ab=marked text with more than one classification==</p>
      <p>==marked text with bad wrapped=</p>
      <p>=marked text with bad wrapped==</p>
      <p>==<strong>strong text in marker, instead of marked text in strong</strong>==</p>"
    `);
  });
});

describe("no options - success", () => {
  // ******************************************
  it("empty markers", async () => {
    const input = dedent(`
      ====

      ==  ==

      Here **empty** ==== marker within a content
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p><mark class="flexible-marker flexible-marker-empty"></mark></p>
      <p><mark class="flexible-marker flexible-marker-empty"></mark></p>
      <p>Here <strong>empty</strong> <mark class="flexible-marker flexible-marker-empty"></mark> marker within a content</p>"
    `);
  });

  // ******************************************
  it("standart usage", async () => {
    const input = dedent(`
      ==default marked== ==  another default marked  == 

      =r=red marked== =b=  blue marked  == 
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p><mark class="flexible-marker flexible-marker-default">default marked</mark> <mark class="flexible-marker flexible-marker-default">another default marked</mark></p>
      <p><mark class="flexible-marker flexible-marker-red">red marked</mark> <mark class="flexible-marker flexible-marker-blue">blue marked</mark></p>"
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
      "<p><strong><mark class="flexible-marker flexible-marker-default">bold marked</mark></strong></p>
      <p>Here <strong><mark class="flexible-marker flexible-marker-red">bold marked</mark></strong></p>
      <p><strong><mark class="flexible-marker flexible-marker-default">bold marked</mark></strong> is here</p>
      <p><strong>strong <mark class="flexible-marker flexible-marker-blue">bold marked</mark></strong></p>"
    `);
  });

  // ******************************************
  it("standart usage with extra content", async () => {
    const input = dedent(`      
      =r=red marked== with extra content =b=  blue marked  == 

      ==default marked== **with extra boldcontent** ==  another default marked    == 
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p><mark class="flexible-marker flexible-marker-red">red marked</mark> with extra content <mark class="flexible-marker flexible-marker-blue">blue marked</mark></p>
      <p><mark class="flexible-marker flexible-marker-default">default marked</mark> <strong>with extra boldcontent</strong> <mark class="flexible-marker flexible-marker-default">another default marked</mark></p>"
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
      "<p>Here is <mark class="flexible-marker flexible-marker-default">marked content</mark></p>
      <p>Here is <mark class="flexible-marker flexible-marker-red">marked content with red classification</mark></p>
      <p>Here is <strong><mark class="flexible-marker flexible-marker-default">bold and marked content</mark></strong></p>
      <h3>Heading with <mark class="flexible-marker flexible-marker-default">marked content</mark></h3>"
    `);
  });
});
