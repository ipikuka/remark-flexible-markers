# remark-flexible-markers

[![NPM version][badge-npm-version]][npm-package-url]
[![NPM downloads][badge-npm-download]][npm-package-url]
[![Build][badge-build]][github-workflow-url]
[![codecov](https://codecov.io/gh/ipikuka/remark-flexible-markers/graph/badge.svg?token=DB491JPTDO)](https://codecov.io/gh/ipikuka/remark-flexible-markers)
[![type-coverage](https://img.shields.io/badge/dynamic/json.svg?label=type-coverage&prefix=%E2%89%A5&suffix=%&query=$.typeCoverage.atLeast&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fipikuka%2Fremark-flexible-markers%2Fmaster%2Fpackage.json)](https://github.com/ipikuka/remark-flexible-markers)
[![typescript][badge-typescript]][typescript-url]
[![License][badge-license]][github-license-url]

This package is a [unified][unified] ([remark][remark]) plugin to add custom `<mark>` element with customizable properties in markdown.

**[unified][unified]** is a project that transforms content with abstract syntax trees (ASTs) using the new parser **[micromark][micromark]**. **[remark][remark]** adds support for markdown to unified. **[mdast][mdast]** is the Markdown Abstract Syntax Tree (AST) which is a specification for representing markdown in a syntax tree.

**This plugin is a remark plugin that transforms the mdast.**

## When should I use this?

This plugin is useful if you want to **add a custom `<mark>` element** in markdown for providing marked or highlighted text, _with custom tag name, custom class name, custom color classification, and also additional properties_. **You can easily create `<mark>` element with the `remark-flexible-markers`.**

## Installation

This package is suitable for ESM only. In Node.js (version 16+), install with npm:

```bash
npm install remark-flexible-markers
```

or

```bash
yarn add remark-flexible-markers
```

## Usage

#### use `==` around the content

```markdown
==marked content==
```

> [!IMPORTANT]
> The `==` in the begining part of representation specifies there is NO `color` specification.

#### use `=[classification key]=` at the beginning and `==` at the end

```markdown
=r=marked content with red classification==
```

> [!IMPORTANT]
> The `=r=` at the beginning part of representation specifies the `color` specification is `"red"`.

Say we have the following file, `example.md`, which consists some flexible markers.

```markdown
==marked content==
=r=marked content==
```

And our module, `example.js`, looks as follows:

```javascript
import { read } from "to-vfile";
import remark from "remark";
import gfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkFlexibleMarkers from "remark-flexible-markers";

main();

async function main() {
  const file = await remark()
    .use(gfm)
    .use(remarkFlexibleMarkers)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(await read("example.md"));

  console.log(String(file));
}
```

Now, running `node example.js` yields:

```html
<p>
  <mark class="flexible-marker flexible-marker-default">marked content</mark>
  <mark class="flexible-marker flexible-marker-red">marked content</mark>
</p>
```

Without `remark-flexible-markers`, you’d get:

```html
<p>==marked content==
=r=marked content==</p>
```

> [!CAUTION]
> **The double equity signs must be adjacent to the content**.\
> **The content must be wrapped with double equity signs, not singular at any side.**\
> **More than one classification is not allowed.**

Here are some bad usage, and will not work.

```markdown
==text with bad wrapped=

=text with bad wrapped==

== text with unwanted space==

==text with unwanted space ==

=ab=text with more than one classification==
```

## It is more flexible and powerful

As of version `^1.2.0`, the `remark-flexible-markers` can handle also the syntax containing other markdown phrases like `strong`, `emphasis`, `link` etc. For example:

```
==**marked bold content**==

==_marked italic content_==

==[marked link](https://google.com)==
```

```html
<p>
  <mark class="flexible-marker flexible-marker-default">
    <strong>marked bold content</strong>
  </mark>
</p>
<p>
  <mark class="flexible-marker flexible-marker-default">
    <em>marked italic content</em>
  </mark>
</p>
<p>
  <mark class="flexible-marker flexible-marker-default">
    <a href="https://google.com">marked link</a>
  </mark>
</p>
```

## Options

All options are **optional** and some of them have **default values**.

```typescript
type RestrictedRecord = Record<string, unknown> & { className?: never };

type Dictionary = Partial<Record<Key, string>>;
type TagNameFunction = (color?: string) => string;
type ClassNameFunction = (color?: string) => string[];
type PropertyFunction = (color?: string) => RestrictedRecord

use(remarkFlexibleMarkers, {
  dictionary?: Dictionary; // explained in the options section
  markerTagName?: string | TagNameFunction; // default is "mark"
  markerClassName?: string | ClassNameFunction; // default is "flexible-marker"
  markerProperties?: PropertyFunction;
  equalityOperator?: string;
  actionForEmptyContent?: "keep" | "remove" | "marker"; // // default is "marker"
} as FlexibleMarkerOptions);
```

#### `dictionary`

It is a **key, value** option for providing **color classification** for the `mark` node.

The dictionary is opinionated, by default.

```typescript
type Key = "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" 
         | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z";

type Dictionary = Partial<Record<Key, string>>;

const dictionary: Dictionary = {
  a: "amber",
  b: "blue",
  c: "cyan",
  d: "brown",
  e: "espresso",
  f: "fuchsia",
  g: "green",
  h: "hotpink",
  i: "indigo",
  j: "jade",
  k: "kiwi",
  l: "lime",
  m: "magenta",
  n: "navyblue",
  o: "orange",
  p: "purple",
  q: "pink",
  r: "red",
  s: "silver",
  t: "teal",
  u: "umber",
  v: "violet",
  w: "white",
  x: "gray",
  y: "yellow",
  z: "black",
};
```

**You can override the dictionary entries.**

```javascript
use(remarkFlexibleMarkers, {
  dictionary: {
    w: "wall"
  },
});
```

Now, it is overriden for only `w` key, and the color classification will be `wall` instead of default one `white`.

```markdown
=w=marked content==
```

```html
<p>
  <mark class="remark-marker remark-marker-wall">marked content</mark>
</p>
```

#### `markerTagName`

It is a **string** or a **callback** `(color?: string) => string` option for providing custom HTML tag name for `mark` nodes.

By default, it is `mark` which is well known HTML element for highlighting the texts.

```javascript
use(remarkFlexibleMarkers, {
  markerTagName: "span",
});
```

Now, the element tag names will be `span`.

```html
<span class="...">marked content</span>
```

The option can take also a callback function, which has an optional argument `color`, and returns **string** representing the **custom tag name**. 

```javascript
use(remarkFlexibleMarkers, {
  markerTagName: (color) => color ?? "yellow",
});
```

Now, the element tag names will be the color name.

```markdown
==marked content==
=r=marked content==
```

```html
<p>
  <yellow class="...">marked content</yellow>
  <red class="...">marked content</red>
</p>
```

#### `markerClassName`

It is a **string** or a **callback** `(color?: string) => string[]` option for providing custom class name for the `mark` node. 

By default, it is `flexible-marker`, and all mark nodes' classnames will contain `flexible-marker`.

A mark node contains also a **secondary class name** representing the **color specification** which starts with the `flexible-marker-` and ends with the `color specification`, like `flexible-marker-red` or `flexible-marker-blue`. If there is no color classification, then the secondary class name will be `flexible-marker-default`.

If a mark syntax in the document has no content, and would wanted to be an empty marker, the class name will contain `flexible-marker-empty`, additionally.

```javascript
use(remarkFlexibleMarkers, {
  markerClassName: "remark-marker",
});
```

Now, the mark nodes will have `remark-marker` as a className, and the secondary class names will start with `remark-marker-`.

```markdown
==marked content==
=r=marked content==
```

```html
<p>
  <mark class="remark-marker remark-marker-default">marked content</mark>
  <mark class="remark-marker remark-marker-red">marked content</mark>
</p>
```

The option can take also a callback function, which has an optional argument `color`, and returns **array of strings** representing **class names**. 

```javascript
use(remarkFlexibleMarkers, {
  markerClassName: (color) => {
    return [`marker-${color ?? "yellow"}`]
  },
});
```

Now, the element class names **will contain only one class name** like `marker-yellow`, `marker-red` etc.

```markdown
==marked content==
=r=marked content==
```

```html
<p>
  <mark class="marker-yellow">marked content</mark>
  <mark class="marker-red">marked content</mark>
</p>
```

> [!WARNING]
> **If you use the `markerClassName` option as a callback function, it is your responsibility to define class names, primary or secondary in an array.**

#### `markerProperties`

It is a **callback** `(color?: string) => Record<string, unknown> & { className?: never }` option to set additional properties for the `mark` node.

The callback function that takes the `color` as optional argument and returns **object** which is going to be used for adding additional properties into the `mark` node.

**The `className` key is forbidden and effectless in the returned object.**

```javascript
use(remarkFlexibleMarkers, {
  markerProperties(color) {
    return {
      ["data-color"]: color,
    };
  },
});
```

Now, the mark nodes which have a color classification will contain `data-color` property.

```markdown
==marked content==
=r=marked content==
```

```html
<p>
  <mark class="flexible-marker flexible-marker-default">marked content</mark>
  <mark class="flexible-marker flexible-marker-red" data-color="red">marked content</mark>
</p>
```

#### `equalityOperator`

It is a **string** option in order not to confuse with mathematical equality operator like `if a == b, then ...`.

If there is a space around **double equality** in a mathematical text, there is no problem, since the plugin will not match with these.

`If a == b and c == d then the theorem is right.` --> will not cause any problem.

But, if there is **NO** space around **double equality** in a mathematical text, the plugin assumes they are marker but actually not. 

`If a==b and c==d then the theorem is right.` --> will cause the plugin match a marker `<mark>b and c</mark>`, unwantedly.

In order the plugin to handle this kind of mathematical expressions correctly, there is `equalityOperator` option.

```javascript
use(remarkFlexibleMarkers, {
  equalityOperator: "=:=",
});
```

```markdown
If a=:=b and c=:=d then the theorem is right
```

Now, the plugin is going to convert the `=:=` into `==` as should be. 

```html
<p>If a==b and c==d then the theorem is right</p>
```

By default, the option is **undefined**, which means no check happens.

#### `actionForEmptyContent`

It is a **union** `"keep" | "remove" | "mark"` option to handle marker syntax with empty content in a markdown document.

By default, it is `mark`, meaningly the plugin will create an empty `<mark>` node for marker syntax with empty content.

I don't know what could be a reason you use empty markers, but anyway I wanted to handle it. Here is an example marker syntax with empty content.

```markdown
====, ==  ==, =r===, =r= ==
```

You have **three options** to handle marker syntax with empty content.

##### **`keep`** will keep the syntax as it is.

```javascript
use(remarkFlexibleMarkers, {
  actionForEmptyContent: "keep",
});
```
will produce:
```html
<p>====, ==  ==, =r===, =r= ==</p>
```

##### **`remove`** will remove the mark syntax with empty content.

```javascript
use(remarkFlexibleMarkers, {
  actionForEmptyContent: "remove",
});
```

will produce:

```html
<p>, , , </p>
```

##### **`mark`** will crate an empty `<mark>` node.

```javascript
use(remarkFlexibleMarkers, {
  actionForEmptyContent: "mark", // actually, it is default
});
```

will produce `<mark>` nodes with additional class name "flexible-marker-empty".

```html
<p>
  <mark class="flexible-marker flexible-marker-default flexible-marker-empty"></mark>,
  <mark class="flexible-marker flexible-marker-default flexible-marker-empty"></mark>,
  <mark class="flexible-marker flexible-marker-red flexible-marker-empty"></mark>,
  <mark class="flexible-marker flexible-marker-red flexible-marker-empty"></mark>
</p>
```

## Examples:

```markdown
Here is ==marked content==

Here is =r=marked content with r classification==

Here are **==marked bold content==** and ==**marked bold content**==

### ==marked content in headings==
```

#### Without any option

```javascript
use(remarkFlexibleMarkers);
```

is going to produce as default:

```html
<p>
  Here is 
  <mark class="flexible-marker flexible-marker-default">marked content</mark>
</p>
<p>
  Here is 
  <mark class="flexible-marker flexible-marker-red">marked content with r classification</mark>
</p>
<p>
  Here are 
  <strong>
    <mark class="flexible-marker flexible-marker-default">marked bold content</mark>
  </strong>
   and 
  <mark class="flexible-marker flexible-marker-default">
    <strong>marked bold content</strong>
  </mark>
</p>
<h3>
  <mark class="flexible-marker flexible-marker-default">marked content in headings</mark>
</h3>
```

#### With options

```javascript
use(remarkFlexibleMarkers, {
  dictionary: {
    r: "rain",
  },
  markerClassName: "custom-marker",
  markerTagName: "span",
  markerProperties(color) {
    return {
      ["data-color"]: color,
    };
  },
});
```

is going to produce:

```html
<p>
  Here is 
  <span class="custom-marker custom-marker-default">marked content</span>
</p>
<p>
  Here is 
  <span class="custom-marker custom-marker-rain" data-color="rain">marked content with r classification</span>
</p>
<p>
  Here are 
  <strong>
    <span class="custom-marker custom-marker-default">marked bold content</span>
  </strong>
   and 
  <span class="custom-marker custom-marker-default">
    <strong>marked bold content</strong>
  </span>
</p>
<h3>
  <span class="custom-marker custom-marker-default">marked content in headings</span>
</h3>
```

> [!TIP]
> You can use the marker syntax in the **tables**, **headings**, **lists**, **blockquotes** etc. You can have a look at the test files in the github repo for detailed examples.

## Syntax tree

This plugin only modifies the mdast (markdown abstract syntax tree) as explained.

## Types

This package is fully typed with [TypeScript][typescript]. The plugin options' type is exported as `FlexibleMarkerOptions`.

## Compatibility

This plugin works with `unified` version 6+ and `remark` version 7+. It is compatible with `mdx` version 2+.

## Security

Use of `remark-flexible-markers` does not involve rehype (hast) or user content so there are no openings for cross-site scripting (XSS) attacks.

## My Plugins

I like to contribute the Unified / Remark / MDX ecosystem, so I recommend you to have a look my plugins.

### My Remark Plugins

- [`remark-flexible-code-titles`](https://www.npmjs.com/package/remark-flexible-code-titles)
  – Remark plugin to add titles or/and containers for the code blocks with customizable properties
- [`remark-flexible-containers`](https://www.npmjs.com/package/remark-flexible-containers)
  – Remark plugin to add custom containers with customizable properties in markdown
- [`remark-ins`](https://www.npmjs.com/package/remark-ins)
  – Remark plugin to add `ins` element in markdown
- [`remark-flexible-paragraphs`](https://www.npmjs.com/package/remark-flexible-paragraphs)
  – Remark plugin to add custom paragraphs with customizable properties in markdown
- [`remark-flexible-markers`](https://www.npmjs.com/package/remark-flexible-markers)
  – Remark plugin to add custom `mark` element with customizable properties in markdown
- [`remark-flexible-toc`](https://www.npmjs.com/package/remark-flexible-toc)
  – Remark plugin to expose the table of contents via `vfile.data` or via an option reference
- [`remark-mdx-remove-esm`](https://www.npmjs.com/package/remark-mdx-remove-esm)
  – Remark plugin to remove import and/or export statements (mdxjsEsm)

### My Rehype Plugins

- [`rehype-pre-language`](https://www.npmjs.com/package/rehype-pre-language)
  – Rehype plugin to add language information as a property to `pre` element
- [`rehype-highlight-code-lines`](https://www.npmjs.com/package/rehype-highlight-code-lines)
  – Rehype plugin to add line numbers to code blocks and allow highlighting of desired code lines
- [`rehype-code-meta`](https://www.npmjs.com/package/rehype-code-meta)
  – Rehype plugin to copy `code.data.meta` to `code.properties.metastring`
- [`rehype-image-toolkit`](https://www.npmjs.com/package/rehype-image-toolkit)
  – Rehype plugin to enhance Markdown image syntax `![]()` and Markdown/MDX media elements (`<img>`, `<audio>`, `<video>`) by auto-linking bracketed or parenthesized image URLs, wrapping them in `<figure>` with optional captions, unwrapping images/videos/audio from paragraph, parsing directives in title for styling and adding attributes, and dynamically converting images into `<video>` or `<audio>` elements based on file extension.

### My Recma Plugins

- [`recma-mdx-escape-missing-components`](https://www.npmjs.com/package/recma-mdx-escape-missing-components)
  – Recma plugin to set the default value `() => null` for the Components in MDX in case of missing or not provided so as not to throw an error
- [`recma-mdx-change-props`](https://www.npmjs.com/package/recma-mdx-change-props)
  – Recma plugin to change the `props` parameter into the `_props` in the `function _createMdxContent(props) {/* */}` in the compiled source in order to be able to use `{props.foo}` like expressions. It is useful for the `next-mdx-remote` or `next-mdx-remote-client` users in `nextjs` applications.
- [`recma-mdx-change-imports`](https://www.npmjs.com/package/recma-mdx-change-imports)
  – Recma plugin to convert import declarations for assets and media with relative links into variable declarations with string URLs, enabling direct asset URL resolution in compiled MDX.
- [`recma-mdx-import-media`](https://www.npmjs.com/package/recma-mdx-import-media)
  – Recma plugin to turn media relative paths into import declarations for both markdown and html syntax in MDX.
- [`recma-mdx-import-react`](https://www.npmjs.com/package/recma-mdx-import-react)
  – Recma plugin to ensure getting `React` instance from the arguments and to make the runtime props `{React, jsx, jsxs, jsxDev, Fragment}` is available in the dynamically imported components in the compiled source of MDX.
- [`recma-mdx-html-override`](https://www.npmjs.com/package/recma-mdx-html-override)
  – Recma plugin to allow selected raw HTML elements to be overridden via MDX components.
- [`recma-mdx-interpolate`](https://www.npmjs.com/package/recma-mdx-interpolate)
  – Recma plugin to enable interpolation of identifiers wrapped in curly braces within the `alt`, `src`, `href`, and `title` attributes of markdown link and image syntax in MDX.

## License

[MIT License](./LICENSE) © ipikuka

### Keywords

🟩 [unified][unifiednpm] 🟩 [remark][remarknpm] 🟩 [remark plugin][remarkpluginnpm] 🟩 [mdast][mdastnpm] 🟩 [markdown][markdownnpm] 🟩 [remark marker][remarkmarkernpm]

[unifiednpm]: https://www.npmjs.com/search?q=keywords:unified
[remarknpm]: https://www.npmjs.com/search?q=keywords:remark
[remarkpluginnpm]: https://www.npmjs.com/search?q=keywords:remark%20plugin
[mdastnpm]: https://www.npmjs.com/search?q=keywords:mdast
[markdownnpm]: https://www.npmjs.com/search?q=keywords:markdown
[remarkmarkernpm]: https://www.npmjs.com/search?q=keywords:remark%20marker

[unified]: https://github.com/unifiedjs/unified
[remark]: https://github.com/remarkjs/remark
[remarkplugins]: https://github.com/remarkjs/remark/blob/main/doc/plugins.md
[mdast]: https://github.com/syntax-tree/mdast
[micromark]: https://github.com/micromark/micromark
[typescript]: https://www.typescriptlang.org/

[badge-npm-version]: https://img.shields.io/npm/v/remark-flexible-markers
[badge-npm-download]:https://img.shields.io/npm/dt/remark-flexible-markers
[npm-package-url]: https://www.npmjs.com/package/remark-flexible-markers

[badge-license]: https://img.shields.io/github/license/ipikuka/remark-flexible-markers
[github-license-url]: https://github.com/ipikuka/remark-flexible-markers/blob/main/LICENSE

[badge-build]: https://github.com/ipikuka/remark-flexible-markers/actions/workflows/publish.yml/badge.svg
[github-workflow-url]: https://github.com/ipikuka/remark-flexible-markers/actions/workflows/publish.yml

[badge-typescript]: https://img.shields.io/npm/types/remark-flexible-markers
[typescript-url]: https://www.typescriptlang.org/
