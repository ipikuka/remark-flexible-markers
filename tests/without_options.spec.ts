import dedent from "dedent";

import { process } from "./util/index";

describe("no options - fail", () => {
  // ******************************************
  it("bad usage", async () => {
    const input = dedent`
      =ab=marked text with more than one classification==

      ==marked text with bad wrapped=

      =marked text with bad wrapped==

      == marked text with unwanted space==

      ==marked text with unwanted space ==
    `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p>=ab=marked text with more than one classification==</p>
      <p>==marked text with bad wrapped=</p>
      <p>=marked text with bad wrapped==</p>
      <p>== marked text with unwanted space==</p>
      <p>==marked text with unwanted space ==</p>"
    `);
  });
});

describe("no options", () => {
  // ******************************************
  it("empty markers", async () => {
    const input = dedent(`
      ====

      a==  ==a

      =x===

      a=x=  ==a
    `);

    expect(await process(input, { actionForEmptyContent: "keep" })).toMatchInlineSnapshot(`
      "<p>====</p>
      <p>a==  ==a</p>
      <p>=x===</p>
      <p>a=x=  ==a</p>"
    `);

    expect(await process(input, { actionForEmptyContent: "mark" })).toMatchInlineSnapshot(`
      "<p><mark class="flexible-marker flexible-marker-default flexible-marker-empty"></mark></p>
      <p>a<mark class="flexible-marker flexible-marker-default flexible-marker-empty"></mark>a</p>
      <p><mark class="flexible-marker flexible-marker-gray flexible-marker-empty"></mark></p>
      <p>a<mark class="flexible-marker flexible-marker-gray flexible-marker-empty"></mark>a</p>"
    `);

    expect(await process(input, { actionForEmptyContent: "remove" })).toMatchInlineSnapshot(`
      "<p></p>
      <p>aa</p>
      <p></p>
      <p>aa</p>"
    `);
  });

  // ******************************************
  it("standart usage", async () => {
    const input = dedent(`
      ==default marked== ==  could not marked  == 

      =r=red marked== =b=  could not blue marked  == 
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p><mark class="flexible-marker flexible-marker-default">default marked</mark> ==  could not marked  ==</p>
      <p><mark class="flexible-marker flexible-marker-red">red marked</mark> =b=  could not blue marked  ==</p>"
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
      =r=red marked== with extra content =b=blue marked== 

      ==default marked== **with extra boldcontent** ==another default marked== 
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
      
      Here are **==bold marked content==** and ==**bold marked content**==
      
      ### ==marked content in headings==
    `);

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p>Here is <mark class="flexible-marker flexible-marker-default">marked content</mark></p>
      <p>Here is <mark class="flexible-marker flexible-marker-red">marked content with red classification</mark></p>
      <p>Here are <strong><mark class="flexible-marker flexible-marker-default">bold marked content</mark></strong> and <mark class="flexible-marker flexible-marker-default"><strong>bold marked content</strong></mark></p>
      <h3><mark class="flexible-marker flexible-marker-default">marked content in headings</mark></h3>"
    `);
  });

  // ******************************************
  it("with two double equality expressions in a text node has not been catched expectedly", async () => {
    const input = dedent`
      If a == b and c == d, then the theorem is true.

      If a==b and c==d, then the theorem is true.

      If a=:=b and c=:=d, then the theorem is true.
    `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p>If a == b and c == d, then the theorem is true.</p>
      <p>If a<mark class="flexible-marker flexible-marker-default">b and c</mark>d, then the theorem is true.</p>
      <p>If a=:=b and c=:=d, then the theorem is true.</p>"
    `);
  });

  // ******************************************
  it("highlight the whole theroem", async () => {
    const input = dedent`
      ==If a == b and c == d, then the theorem is true.==

      ==If a==b and c==d, then the theorem is true.==

      ==If a=:=b and c=:=d, then the theorem is true.==
    `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p><mark class="flexible-marker flexible-marker-default">If a == b and c == d, then the theorem is true.</mark></p>
      <p><mark class="flexible-marker flexible-marker-default">If a</mark>b and c<mark class="flexible-marker flexible-marker-default">d, then the theorem is true.</mark></p>
      <p><mark class="flexible-marker flexible-marker-default">If a=:=b and c=:=d, then the theorem is true.</mark></p>"
    `);
  });

  // ******************************************
  it("nested markers don't work, arbitrary marked texts are considered right", async () => {
    const input = dedent`
      ==outer ==inner== marked==

      ==marked==inner==marked==
    `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p><mark class="flexible-marker flexible-marker-default">outer ==inner</mark> marked==</p>
      <p><mark class="flexible-marker flexible-marker-default">marked</mark>inner<mark class="flexible-marker flexible-marker-default">marked</mark></p>"
    `);
  });

  // ******************************************
  it("marker works if contains other phrasing contents", async () => {
    const input = dedent`
      =r=**xxx=g=_yyy_==zzz**==

      =r=Google is [=g=another marker==](https://www.google.com) in marker==
    `;

    expect(await process(input)).toMatchInlineSnapshot(`
      "<p><mark class="flexible-marker flexible-marker-red"><strong>xxx<mark class="flexible-marker flexible-marker-green"><em>yyy</em></mark>zzz</strong></mark></p>
      <p><mark class="flexible-marker flexible-marker-red">Google is <a href="https://www.google.com"><mark class="flexible-marker flexible-marker-green">another marker</mark></a> in marker</mark></p>"
    `);
  });
});
