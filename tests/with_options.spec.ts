import dedent from "dedent";

import { FlexibleMarkerOptions } from "../src";
import { process } from "./util/index";

const options: FlexibleMarkerOptions = {
  dictionary: { b: "brother" },
  markerClassName: "custom-marker",
  markerTagName: "span",
  markerProperties(color) {
    return {
      ["data-color"]: color,
    };
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
      "<p><span class="custom-marker custom-marker-default custom-marker-empty"></span></p>
      <p><span class="custom-marker custom-marker-default custom-marker-empty"></span></p>
      <p><span class="custom-marker custom-marker-gray custom-marker-empty" data-color="gray"></span></p>
      <p><span class="custom-marker custom-marker-gray custom-marker-empty" data-color="gray"></span></p>"
    `);
  });

  // ******************************************
  it("standart usage", async () => {
    const input = dedent(`
      ==default marked== ==  could not marked  == 

      =r=red marked== =b=  could not blue marked  == 
    `);

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "<p><span class="custom-marker custom-marker-default">default marked</span> ==  could not marked  ==</p>
      <p><span class="custom-marker custom-marker-red" data-color="red">red marked</span> =b=  could not blue marked  ==</p>"
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
      "<p><strong><span class="custom-marker custom-marker-default">bold marked</span></strong></p>
      <p>Here <strong><span class="custom-marker custom-marker-red" data-color="red">bold marked</span></strong></p>
      <p><strong><span class="custom-marker custom-marker-default">bold marked</span></strong> is here</p>
      <p><strong>strong <span class="custom-marker custom-marker-brother" data-color="brother">bold marked</span></strong></p>"
    `);
  });

  // ******************************************
  it("standart usage with extra content", async () => {
    const input = dedent(`      
      =r=red marked== with extra content =b=blue marked== 

      ==default marked== **with extra boldcontent** ==another default marked== 
    `);

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "<p><span class="custom-marker custom-marker-red" data-color="red">red marked</span> with extra content <span class="custom-marker custom-marker-brother" data-color="brother">blue marked</span></p>
      <p><span class="custom-marker custom-marker-default">default marked</span> <strong>with extra boldcontent</strong> <span class="custom-marker custom-marker-default">another default marked</span></p>"
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
      "<p>Here is <span class="custom-marker custom-marker-default">marked content</span></p>
      <p>Here is <span class="custom-marker custom-marker-red" data-color="red">marked content with red classification</span></p>
      <p>Here are <strong><span class="custom-marker custom-marker-default">bold marked content</span></strong> and <span class="custom-marker custom-marker-default"><strong>bold marked content</strong></span></p>
      <h3><span class="custom-marker custom-marker-default">marked content in headings</span></h3>"
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
      <p>If a<span class="custom-marker custom-marker-default">b and c</span>d, then the theorem is true.</p>
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
      "<p><span class="custom-marker custom-marker-default">If a == b and c == d, then the theorem is true.</span></p>
      <p><span class="custom-marker custom-marker-default">If a</span>b and c<span class="custom-marker custom-marker-default">d, then the theorem is true.</span></p>
      <p><span class="custom-marker custom-marker-default">If a==b and c==d, then the theorem is true.</span></p>"
    `);
  });

  // ******************************************
  it("nested markers don't work, arbitrary marked texts are considered right", async () => {
    const input = dedent`
      ==outer ==inner== marked==

      ==marked==inner==marked==
    `;

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "<p><span class="custom-marker custom-marker-default">outer ==inner</span> marked==</p>
      <p><span class="custom-marker custom-marker-default">marked</span>inner<span class="custom-marker custom-marker-default">marked</span></p>"
    `);
  });

  // ******************************************
  it("marker works if contains other phrasing contents", async () => {
    const input = dedent`
      =r=**xxx=g=_yyy_==zzz**==

      =r=Google is [=g=another marker==](https://www.google.com) in marker==
    `;

    expect(await process(input, options)).toMatchInlineSnapshot(`
      "<p><span class="custom-marker custom-marker-red" data-color="red"><strong>xxx<span class="custom-marker custom-marker-green" data-color="green"><em>yyy</em></span>zzz</strong></span></p>
      <p><span class="custom-marker custom-marker-red" data-color="red">Google is <a href="https://www.google.com"><span class="custom-marker custom-marker-green" data-color="green">another marker</span></a> in marker</span></p>"
    `);
  });
});
