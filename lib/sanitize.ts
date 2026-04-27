// lib/sanitize.ts
import sanitizeHtml from "sanitize-html";

export function sanitizePost(content: string) {
  return sanitizeHtml(content, {
    allowedTags: [
      "h1", "h2", "h3", "h4", "h5", "h6",
      "p", "strong", "em", "s", "code", "pre", "blockquote",
      "ul", "ol", "li",
      "a", "img", "figure", "figcaption",
      "br", "hr", "div", "span",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel", "class"],
      img: ["src", "alt", "width", "height", "class"],
      "*": ["class"],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer" }),
    },
  });
}