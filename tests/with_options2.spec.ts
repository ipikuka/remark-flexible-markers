import dedent from "dedent";

import { FlexibleMarkerOptions } from "../src";
import { process } from "./util/index";

const options: FlexibleMarkerOptions = {
  dictionary: { b: "brother" },
  markerClassName: (color) => {
    return [`remark-marker-${color ?? "yellow"}`];
  },
  markerTagName: (color) => {
    return color ?? "yellow";
  },
  equalityOperator: "=:=",
};

describe("with options - fail", () => {
  // ******************************************
  it("bad usage", async () => {
    const input = dedent`
      =ab=marked text with more than one classification==

      ==marked text with bad wrapped=

      =marked text with bad wrapped==

      == marked text with unwanted space==

      ==marked text with unwanted space ==
    `;

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "<p>=ab=marked text with more than one classification==</p>
      <p>==marked text with bad wrapped=</p>
      <p>=marked text with bad wrapped==</p>
      <p>== marked text with unwanted space==</p>
      <p>==marked text with unwanted space ==</p>"
    `);
  });
});

describe("with options", () => {
  // ******************************************
  it("empty markers", async () => {
    const input = dedent(`
      ====

      ==  ==

      =x===

      =x=  ==
    `);

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "<p><yellow class="remark-marker-yellow"></yellow></p>
      <p><yellow class="remark-marker-yellow"></yellow></p>
      <p><gray class="remark-marker-gray"></gray></p>
      <p><gray class="remark-marker-gray"></gray></p>"
    `);
  });

  // ******************************************
  it("standart usage", async () => {
    const input = dedent(`
      ==default marked== ==  could not marked  == 

      =r=red marked== =b=  could not blue marked  == 
    `);

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "<p><yellow class="remark-marker-yellow">default marked</yellow> ==  could not marked  ==</p>
      <p><red class="remark-marker-red">red marked</red> =b=  could not blue marked  ==</p>"
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

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "<p><strong><yellow class="remark-marker-yellow">bold marked</yellow></strong></p>
      <p>Here <strong><red class="remark-marker-red">bold marked</red></strong></p>
      <p><strong><yellow class="remark-marker-yellow">bold marked</yellow></strong> is here</p>
      <p><strong>strong <brother class="remark-marker-brother">bold marked</brother></strong></p>"
    `);
  });

  // ******************************************
  it("standart usage with extra content", async () => {
    const input = dedent(`      
      =r=red marked== with extra content =b=blue marked== 

      ==default marked== **with extra boldcontent** ==another default marked== 
    `);

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "<p><red class="remark-marker-red">red marked</red> with extra content <brother class="remark-marker-brother">blue marked</brother></p>
      <p><yellow class="remark-marker-yellow">default marked</yellow> <strong>with extra boldcontent</strong> <yellow class="remark-marker-yellow">another default marked</yellow></p>"
    `);
  });

  // ******************************************
  it("example in README", async () => {
    const input = dedent(`      
      Here is ==marked content==

      Here is =r=marked content with red classification==
      
      Here are **==bold marked content==** and ==**bold marked content**==
      
      ### ==marked content in headings==
    `);

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "<p>Here is <yellow class="remark-marker-yellow">marked content</yellow></p>
      <p>Here is <red class="remark-marker-red">marked content with red classification</red></p>
      <p>Here are <strong><yellow class="remark-marker-yellow">bold marked content</yellow></strong> and <yellow class="remark-marker-yellow"><strong>bold marked content</strong></yellow></p>
      <h3><yellow class="remark-marker-yellow">marked content in headings</yellow></h3>"
    `);
  });

  // ******************************************
  it("with two double equality expressions in a text node has not been catched expectedly", async () => {
    const input = dedent`
      If a == b and c == d, then the theorem is true.

      If a==b and c==d, then the theorem is true.

      If a=:=b and c=:=d, then the theorem is true.
    `;

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "<p>If a == b and c == d, then the theorem is true.</p>
      <p>If a<yellow class="remark-marker-yellow">b and c</yellow>d, then the theorem is true.</p>
      <p>If a==b and c==d, then the theorem is true.</p>"
    `);
  });

  // ******************************************
  it("highlight the whole theroem", async () => {
    const input = dedent`
      ==If a == b and c == d, then the theorem is true.==

      ==If a==b and c==d, then the theorem is true.==

      ==If a=:=b and c=:=d, then the theorem is true.==
    `;

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "<p><yellow class="remark-marker-yellow">If a == b and c == d, then the theorem is true.</yellow></p>
      <p><yellow class="remark-marker-yellow">If a</yellow>b and c<yellow class="remark-marker-yellow">d, then the theorem is true.</yellow></p>
      <p><yellow class="remark-marker-yellow">If a==b and c==d, then the theorem is true.</yellow></p>"
    `);
  });

  // ******************************************
  it("nested markers don't work, arbitrary marked texts are considered right", async () => {
    const input = dedent`
      ==outer ==inner== marked==

      ==marked==inner==marked==
    `;

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "<p><yellow class="remark-marker-yellow">outer ==inner</yellow> marked==</p>
      <p><yellow class="remark-marker-yellow">marked</yellow>inner<yellow class="remark-marker-yellow">marked</yellow></p>"
    `);
  });

  // ******************************************
  it("marker works if contains other phrasing contents", async () => {
    const input = dedent`
      =r=**xxx=g=_yyy_==zzz**==

      =r=Google is [=g=another marker==](https://www.google.com) in marker==
    `;

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "<p><red class="remark-marker-red"><strong>xxx<green class="remark-marker-green"><em>yyy</em></green>zzz</strong></red></p>
      <p><red class="remark-marker-red">Google is <a href="https://www.google.com"><green class="remark-marker-green">another marker</green></a> in marker</red></p>"
    `);
  });
});
