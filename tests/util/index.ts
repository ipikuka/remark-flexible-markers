import { unified } from "unified";
import remarkParse from "remark-parse";
import gfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import type { VFileCompatible, Value } from "vfile";

import plugin, { FlexibleMarkerOptions } from "../../src";

const compilerCreator = (options?: FlexibleMarkerOptions) =>
  unified()
    .use(remarkParse)
    .use(gfm)
    .use(plugin, options)
    .use(remarkRehype)
    .use(rehypeStringify);

export const process = async (
  content: VFileCompatible,
  options?: FlexibleMarkerOptions,
): Promise<Value> => {
  const vFile = await compilerCreator(options).process(content);
  return vFile.value;
};
