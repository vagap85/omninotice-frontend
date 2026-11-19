import { Extension } from '@tiptap/core';
import Placeholder from '@tiptap/extension-placeholder';
import { Plugin } from '@tiptap/pm/state';
import StarterKit from '@tiptap/starter-kit';

const emojiPresentation = /\p{Emoji_Presentation}/u;
const extendedPictographic = /\p{Extended_Pictographic}/u;
const regionalFlag = /^(?:\p{Regional_Indicator}){2}$/u;
const keycapEmoji = /^[#*0-9]\uFE0F?\u20E3$/u;

interface GraphemeSegment {
  segment: string;
  index: number;
}

interface GraphemeSegmenter {
  segment: (text: string) => Iterable<GraphemeSegment>;
}

const IntlWithSegmenter = Intl as typeof Intl & {
  Segmenter?: new (
    locales?: string | string[],
    options?: { granularity: 'grapheme' }
  ) => GraphemeSegmenter;
};

const segmenter = IntlWithSegmenter.Segmenter
  ? new IntlWithSegmenter.Segmenter(undefined, { granularity: 'grapheme' })
  : null;

function isEmojiGrapheme(grapheme: string): boolean {
  return (
    emojiPresentation.test(grapheme) ||
    (grapheme.includes('\uFE0F') && extendedPictographic.test(grapheme)) ||
    regionalFlag.test(grapheme) ||
    keycapEmoji.test(grapheme)
  );
}

function createUnformattedEmojiExtension() {
  return Extension.create({
    name: 'unformattedEmoji',

    addProseMirrorPlugins() {
      return [
        new Plugin({
          appendTransaction: (transactions, _oldState, newState) => {
            if (!transactions.some((transaction) => transaction.docChanged)) {
              return null;
            }

            if (!segmenter) {
              throw new Error(
                'Telegram message formatting requires Intl.Segmenter support.'
              );
            }

            const transaction = newState.tr;
            newState.doc.descendants((node, position) => {
              if (
                !node.isText ||
                typeof node.text !== 'string' ||
                node.marks.length === 0
              ) {
                return;
              }

              for (const { segment, index } of segmenter.segment(node.text)) {
                if (!isEmojiGrapheme(segment)) continue;

                for (const mark of node.marks) {
                  transaction.removeMark(
                    position + index,
                    position + index + segment.length,
                    mark
                  );
                }
              }
            });

            return transaction.docChanged ? transaction : null;
          }
        })
      ];
    }
  });
}

export function createTelegramMessageExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      blockquote: false,
      bulletList: false,
      codeBlock: false,
      heading: false,
      horizontalRule: false,
      link: false,
      listItem: false,
      listKeymap: false,
      orderedList: false,
      trailingNode: false
    }),
    Placeholder.configure({ placeholder }),
    createUnformattedEmojiExtension()
  ];
}
