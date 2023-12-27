# remark-flexible-markers

[![NPM version][npm-image]][npm-url]
[![Build][github-build]][github-build-url]
![npm-typescript]
[![License][github-license]][github-license-url]

This package is a [unified][unified] ([remark][remark]) plugin to add custom marker in a flexible way (compatible with new parser "[micromark][micromark]").

"**unified**" is a project that transforms content with abstract syntax trees (ASTs). "**remark**" adds support for markdown to unified. "**mdast**" is the markdown abstract syntax tree (AST) that remark uses.

**This plugin is a remark plugin that transforms the mdast.**

## When should I use this?

This plugin is useful if you want to **add a custom <mark> element** in markdown for providing marked or highlighted text, _with custom tag name, custom class name, custom color classification, and also additional properties_. **You can easily create <mark> element with the `remark-flexible-markers`.**

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

**use `==` or `=[classification key]=`**

#### ==marked content==

#### =r=marked content with red classification==

Say we have the following file, `example.md`, which consists some flexible markers.

```markdown
==marked content==
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

Now, running `node example.js` yields:\

```html
<p><mark class="flexible-marker flexible-marker-default">marked content</mark></p>
```

Without `remark-flexible-markers`, you’d get:

```html
<p>==marked content==</p>
```

## Dictionary

```javascript
{
  a: "amber",
  b: "blue",
  c: "cyan",
  d: "brown",
  e: undefined,
  f: "fuchsia",
  g: "green",
  h: "hotpink",
  i: undefined,
  j: undefined,
  k: undefined,
  l: "lime",
  m: "magenta",
  n: "navyblue",
  o: "orange",
  p: "purple",
  q: "pink",
  r: "red",
  s: "silver",
  t: "teal",
  u: undefined,
  v: "violet",
  w: "white",
  x: "gray",
  y: "yellow",
  z: "black",
};
```

## Options

All options are **optional** and have **default values**.

```javascript
// type Dictionary = Partial<Record<Keys, string | undefined>>;
// type PropertyFunction = (color?: string) => Record<string, unknown>;

use(remarkFlexibleMarkers, {
  dictionary?: Dictionary; // default is represented above
  markerTagName?: string; // default is "mark"
  markerClassName?: string; // default is "flexible-marker"
  markerProperties?: PropertyFunction, // default is undefined
} as FlexibleMarkerOptions);
```

#### `dictionary`

It is an **key, value** option for providing color classification value for the `mark` node. If you provide `dictionary: {w: "wall"}`, it overrides to the only `w` key, and the value would be "wall" instead of default one "white".

#### `markerTagName`

It is a **string** option for providing custom HTML tag name for the `mark` node other than `mark`.

#### `markerClassName`

It is a **string** option for providing custom className for the `mark` node other than `flexible-marker`.

#### `markerProperties`

It is an option to set additional properties for the `mark` node. It is a callback function that takes the `color` as optional argument and returns the object which is going to be used for adding additional properties into the `mark` node. If you input for example as `=r=`, the param `color` would be `"red"`.

## Examples:

```markdown
Here is ==marked content==

Here is =r=marked content with red classification==

Here is **==bold and marked content==**

### Heading with ==marked content in heading==
```

#### Without any option

```javascript
use(remarkFlexibleMarkers);
```

is going to produce as default:

```html
<p>Here is <mark class="flexible-marker flexible-marker-default">marked content</mark></p>
<p>Here is <mark class="flexible-marker flexible-marker-red">marked content with red classification</mark></p>
<p>Here is <strong><mark class="flexible-marker flexible-marker-default">bold and marked content</mark></strong></p>
<h3>Heading with <mark class="flexible-marker flexible-marker-default">marked content in heading</mark></h3>
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
<p>Here is <span class="custom-marker custom-marker-default">marked content</span></p>
<p>Here is <span class="custom-marker custom-marker-rain" data-color="rain">marked content with red classification</span></p>
<p>Here is <strong><span class="custom-marker custom-marker-default">bold and marked content</span></strong></p>
<h3>Heading with <span class="custom-marker custom-marker-default">marked content</span></h3>
```

You can use the marker syntax in the tables, headings, lists, blockquotes etc. For detailed examples, you can have a look at the test files in the github repo.

## Syntax tree

This plugin only modifies the mdast (markdown abstract syntax tree) as explained.

## Types

This package is fully typed with [TypeScript][typeScript]. The plugin options' type is exported as `FlexibleMarkerOptions`.

## Compatibility

This plugin works with unified version 6+ and remark version 7+. It is compatible with mdx version.2.

## Security

Use of `remark-flexible-markers` does not involve rehype (hast) or user content so there are no openings for cross-site scripting (XSS) attacks.

## My Remark Plugins

The remark packages I have published are presented below:
+ [`remark-flexible-code-titles`](https://www.npmjs.com/package/remark-flexible-code-titles)
  – Remark plugin to add titles or/and containers for the code blocks with customizable properties
+ [`remark-flexible-containers`](https://www.npmjs.com/package/remark-flexible-containers)
  – Remark plugin to add custom containers with customizable properties in markdown
+ [`remark-flexible-paragraphs`](https://www.npmjs.com/package/remark-flexible-paragraphs)
  – Remark plugin to add custom paragraphs with customizable properties in markdown
+ [`remark-flexible-markers`](https://www.npmjs.com/package/remark-flexible-markers)
  – Remark plugin to add custom `mark` element with customizable properties in markdown
+ [`remark-ins`](https://www.npmjs.com/package/remark-ins)
  – Remark plugin to add `ins` element in markdown

## License

[MIT][license] © ipikuka

### Keywords

[unified][unifiednpm] [remark][remarknpm] [remark-plugin][remarkpluginnpm] [mdast][mdastnpm] [markdown][markdownnpm] [remark marker][remarkCustomMarkersnpm]

[unified]: https://github.com/unifiedjs/unified
[unifiednpm]: https://www.npmjs.com/search?q=keywords:unified
[remark]: https://github.com/remarkjs/remark
[remarknpm]: https://www.npmjs.com/search?q=keywords:remark
[remarkpluginnpm]: https://www.npmjs.com/search?q=keywords:remark%20plugin
[mdast]: https://github.com/syntax-tree/mdast
[mdastnpm]: https://www.npmjs.com/search?q=keywords:mdast
[micromark]: https://github.com/micromark/micromark
[typescript]: https://www.typescriptlang.org/
[license]: https://github.com/ipikuka/remark-flexible-markers/blob/main/LICENSE
[markdownnpm]: https://www.npmjs.com/search?q=keywords:markdown
[remarkCustomMarkersnpm]: https://www.npmjs.com/search?q=keywords:remark%20custom%20marker
[npm-url]: https://www.npmjs.com/package/remark-flexible-markers
[npm-image]: https://img.shields.io/npm/v/remark-flexible-markers
[github-license]: https://img.shields.io/github/license/ipikuka/remark-flexible-markers
[github-license-url]: https://github.com/ipikuka/remark-flexible-markers/blob/master/LICENSE
[github-build]: https://github.com/ipikuka/remark-flexible-markers/actions/workflows/publish.yml/badge.svg
[github-build-url]: https://github.com/ipikuka/remark-flexible-markers/actions/workflows/publish.yml
[npm-typescript]: https://img.shields.io/npm/types/remark-flexible-markers
