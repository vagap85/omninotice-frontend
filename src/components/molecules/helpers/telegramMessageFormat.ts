import type { JSONContent } from '@tiptap/core';

export const markTags: Record<string, string> = {
  bold: 'b',
  italic: 'i',
  underline: 'u',
  strike: 's',
  code: 'code'
};

const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const getContent = (node: JSONContent) => node.content ?? [];

export function getTelegramMessageText(content: JSONContent): string {
  switch (content.type) {
    case 'doc':
      return getContent(content).map(getTelegramMessageText).join('\n');
    case 'paragraph':
      return getContent(content).map(getTelegramMessageText).join('');
    case 'hardBreak':
      return '\n';
    case 'text':
      return content.text ?? '';
    default:
      throw new Error(`Unsupported Telegram message node: ${content.type}`);
  }
}

function renderTextNode(node: JSONContent): string {
  let html = escapeHtml(node.text ?? '');
  const marks = node.marks ?? [];
  const codeMark = marks.find(({ type }) => type === 'code');
  const marksToRender = codeMark ? [codeMark] : marks;

  for (const mark of [...marksToRender].reverse()) {
    const tag = markTags[mark.type];
    if (!tag) {
      throw new Error(`Unsupported Telegram message mark: ${mark.type}`);
    }
    html = `<${tag}>${html}</${tag}>`;
  }

  return html;
}

function renderNode(node: JSONContent): string {
  switch (node.type) {
    case 'doc':
      return getContent(node).map(renderNode).join('\n');
    case 'paragraph':
      return getContent(node).map(renderNode).join('');
    case 'hardBreak':
      return '\n';
    case 'text':
      return renderTextNode(node);
    default:
      throw new Error(`Unsupported Telegram message node: ${node.type}`);
  }
}

export function telegramMessageJsonToHtml(content: JSONContent): string {
  return renderNode(content);
}
