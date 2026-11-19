import {
  Icon,
  IconButton,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger
} from '@chakra-ui/react';
import EmojiPicker, {
  EmojiStyle,
  Theme,
  type EmojiClickData
} from 'emoji-picker-react';
import russianEmojiData from 'emoji-picker-react/data/emojis-ru';
import { useState } from 'react';
import { LuSmile } from 'react-icons/lu';

interface EmojiPickerPopoverProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPickerPopover({ onSelect }: EmojiPickerPopoverProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      placement="bottom-end"
      isLazy
    >
      <PopoverTrigger>
        <IconButton
          type="button"
          aria-label="Вставить эмодзи"
          title="Вставить эмодзи"
          icon={
            <Icon
              as={LuSmile}
              boxSize={5}
            />
          }
          variant="outline"
          borderColor="gray.200"
          borderRadius="5px"
          bg="gray.50"
          color="#12233F"
          w="32px"
          h="32px"
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => setIsOpen((open) => !open)}
        />
      </PopoverTrigger>
      <PopoverContent
        w="350px"
        maxW="calc(100vw - 24px)"
        overflow="hidden"
        border="none"
      >
        <PopoverBody p={0}>
          <EmojiPicker
            width="100%"
            height={400}
            emojiData={russianEmojiData}
            emojiStyle={EmojiStyle.NATIVE}
            theme={Theme.LIGHT}
            searchDisabled={false}
            searchPlaceholder="Поиск эмодзи"
            searchLabel="Поиск эмодзи"
            searchClearButtonLabel="Очистить поиск"
            labels={{
              searchPlaceholder: 'Поиск эмодзи',
              searchLabel: 'Поиск эмодзи',
              searchClear: 'Очистить поиск',
              searchResultsNone: 'Эмодзи не найдены',
              searchResultsOne: 'Найден 1 эмодзи',
              searchResultsMany: 'Найдено %n эмодзи',
              categoryNavigation: 'Категории эмодзи',
              reactions: 'Реакции',
              expandReactions: 'Показать все эмодзи',
              loading: 'Загрузка эмодзи',
              loadingError: 'Не удалось загрузить эмодзи',
              retryLoading: 'Повторить',
              skinToneNeutral: 'Стандартный оттенок кожи',
              skinToneLight: 'Светлый оттенок кожи',
              skinToneMediumLight: 'Светло-средний оттенок кожи',
              skinToneMedium: 'Средний оттенок кожи',
              skinToneMediumDark: 'Темно-средний оттенок кожи',
              skinToneDark: 'Темный оттенок кожи'
            }}
            previewConfig={{
              defaultCaption: 'Выберите эмодзи',
              showPreview: true
            }}
            onEmojiClick={(emoji: EmojiClickData) => {
              onSelect(emoji.emoji);
              setIsOpen(false);
            }}
          />
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
