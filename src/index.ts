import { visit, type Visitor, type VisitorResult } from "unist-util-visit";
import type { Plugin, Transformer } from "unified";
import type { Paragraph, Root, Text } from "mdast";
import { u } from "unist-builder";

// satisfies the regex [a-z]
type Keys =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z";

type Dictionary = Partial<Record<Keys, string | undefined>>;

const dictionary: Dictionary = {
  a: "amber",
  b: "blue",
  c: "cyan",
  d: "brown",
  e: undefined,
  f: "fuchsia",
  g: "gray",
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
  x: undefined,
  y: "yellow",
  z: "black",
};

type TPropertyFunction = (color?: string) => Record<string, unknown>;

export type FlexibleMarkerOptions = {
  dictionary?: Dictionary;
  markerTagName?: string;
  markerClassName?: string;
  markerProperties?: TPropertyFunction;
};

const DEFAULT_SETTINGS: FlexibleMarkerOptions = {
  dictionary,
  markerTagName: "mark",
  markerClassName: "flexible-marker",
  markerProperties: undefined,
};

export const REGEX = /=([a-z]?)=\s*([^=]*[^ ])?\s*==/;
export const REGEX_GLOBAL = /=([a-z]?)=\s*([^=]*[^ ])?\s*==/g;

/**
 *
 * This plugin turns ==content== into a <mark> element with customizable classification
 *
 * for example:
 *
 * Here is ==marked text with default color==
 * Here is =r=marked text with red classification==
 *
 */
export const plugin: Plugin<[FlexibleMarkerOptions?], Root> = (options) => {
  const settings = Object.assign({}, DEFAULT_SETTINGS, options);

  if (options?.dictionary && Object.keys(options.dictionary).length) {
    settings.dictionary = Object.assign({}, dictionary, options.dictionary);
  }

  /**
   *
   * constracts the custom <mark> node
   *
   */
  const constructMarker = (
    color: string | undefined,
    markedText: string | undefined,
  ): Paragraph => {
    let _properties: Record<string, unknown> | undefined;

    if (settings.markerProperties) {
      _properties = settings.markerProperties(color);

      Object.entries(_properties).forEach(([k, v]) => {
        if ((typeof v === "string" && v === "") || (Array.isArray(v) && v.length === 0)) {
          _properties && (_properties[k] = undefined);
        }
      });
    }

    // https://github.com/syntax-tree/mdast-util-to-hast#example-supporting-custom-nodes
    return {
      type: "paragraph",
      children: [{ type: "text", value: markedText ?? "" }],
      data: {
        hName: settings.markerTagName,
        hProperties: {
          className: !markedText
            ? [settings.markerClassName, `${settings.markerClassName}-empty`]
            : color
            ? [settings.markerClassName, `${settings.markerClassName}-${color}`]
            : [settings.markerClassName, `${settings.markerClassName}-default`],
          ...(_properties && { ..._properties }),
        },
      },
    };
  };

  /**
   *
   * visits the text nodes which match with the mark syntax (==markedtextcontent==)
   *
   */
  const visitor: Visitor<Text> = function (node, index, parent): VisitorResult {
    if (!parent) return;

    if (!REGEX.test(node.value)) return;

    const children: Array<Text | Paragraph> = [];
    const value = node.value;
    let tempValue = "";
    let prevMatchIndex = 0;
    let prevMatchLength = 0;

    const matches = Array.from(value.matchAll(REGEX_GLOBAL));

    for (let index = 0; index < matches.length; index++) {
      const match = matches[index];

      const mIndex = match.index ?? 0;
      const mLength = match[0].length; // match[0] is the matched input

      // could be a text part before each matched part
      const textPartIndex = index === 0 ? 0 : prevMatchIndex + prevMatchLength;

      prevMatchIndex = mIndex;
      prevMatchLength = mLength;

      // if there is a text part before
      if (mIndex > textPartIndex) {
        const textValue = value.substring(textPartIndex, mIndex);

        const textNode = u("text", textValue) as Text;
        children.push(textNode);
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [input, classification, markedText] = match;

      const markerNode = constructMarker(
        settings.dictionary ? settings.dictionary[classification as Keys] : undefined,
        markedText,
      );

      children.push(markerNode);

      // control for the last text node if exists after the last match
      tempValue = value.slice(mIndex + mLength);
    }

    // if there is still text after the last match
    if (tempValue) {
      const textNode = u("text", tempValue) as Text;
      children.push(textNode);
    }

    if (children.length) parent.children.splice(index!, 1, ...children);
  };

  const transformer: Transformer<Root> = (tree) => {
    visit(tree, "text", visitor);
  };

  return transformer;
};

export default plugin;
