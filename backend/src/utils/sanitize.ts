import sanitizeHtml from 'sanitize-html';

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Allows safe HTML tags (formatting, links, images, tables, video embeds)
 * while stripping dangerous elements like <script>, event handlers, etc.
 * Iframes are restricted to approved video hostnames only.
 */
export function sanitizeRichText(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img',
      'h1',
      'h2',
      'span',
      'u',
      's',
      'sub',
      'sup',
      'figure',
      'figcaption',
      'video',
      'source',
      'iframe',
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      a: ['href', 'target', 'rel', 'title'],
      span: ['style', 'class'],
      td: ['colspan', 'rowspan', 'style'],
      th: ['colspan', 'rowspan', 'style'],
      video: ['src', 'width', 'height', 'controls'],
      source: ['src', 'type'],
      iframe: [
        'src',
        'width',
        'height',
        'style',
        'scrolling',
        'frameborder',
        'allow',
        'allowfullscreen',
        'allowtransparency',
        'referrerpolicy',
        'title',
        'loading',
      ],
      div: [
        'style',
        'data-youtube-video',
        'data-facebook-video',
        'data-href',
        'data-width',
        'data-allowfullscreen',
        'data-autoplay',
        'data-lazy',
        'data-show-text',
        'data-show-captions',
      ],
      '*': ['class'],
    },
    allowedStyles: {
      '*': {
        color: [/.*/],
        'background-color': [/.*/],
        'text-align': [/.*/],
        'font-size': [/.*/],
        'font-weight': [/.*/],
        width: [/.*/],
        'max-width': [/.*/],
        height: [/.*/],
        position: [/.*/],
        inset: [/.*/],
        'aspect-ratio': [/.*/],
        margin: [/.*/],
        border: [/.*/],
        'border-width': [/.*/],
        'border-style': [/.*/],
        'border-color': [/.*/],
        'border-image': [/.*/],
        overflow: [/.*/],
      },
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedIframeHostnames: [
      'www.youtube.com',
      'www.youtube-nocookie.com',
      'youtube.com',
      'facebook.com',
      'www.facebook.com',
      'web.facebook.com',
      'm.facebook.com',
    ],
  });
}

/**
 * Strips all HTML tags from a string. Use for plain-text fields
 * (e.g., reviews, names) that should never contain HTML.
 */
export function stripHtml(text: string): string {
  return sanitizeHtml(text, {
    allowedTags: [],
    allowedAttributes: {},
  });
}
