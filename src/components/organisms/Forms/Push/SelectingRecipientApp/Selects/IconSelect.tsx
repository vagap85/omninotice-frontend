import { Box, Button, Flex, Text, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';

import SelectIconModal from '../../../../Modals/SelectIconModal';
import { useSelectingRecipientApp } from '../hooks/useSelectingRecipientApp';
import type { SelectedAppIcon } from '../types/types';
import CollectionIcon from '../utils/CollectionIcon';
import { getIconBackgroundColor } from '../utils/iconBackgroundColor';

const COLLECTION_ICONS: SelectedAppIcon[] = [
  {
    id: '0',
    path: 'collections/bell-ring-icon.svg',
    title: 'Стандартная',
    description: 'Если не выбрать другую, получатель увидит эту'
  },
  {
    id: '1',
    path: 'collections/calendar-date-icon.svg',
    title: 'Дата и срок',
    description: 'Отпуск, встреча, дедлайн, начало и конец периода'
  },
  {
    id: '2',
    path: 'collections/check-icon.svg',
    title: 'Готово',
    description: 'Согласовано, завершено, заявка одобрена'
  },
  {
    id: '3',
    path: 'collections/information-icon.svg',
    title: 'Важное',
    description: 'Требует действия или внимания в срок'
  },
  {
    id: '4',
    path: 'collections/about-icon.svg',
    title: 'Справка',
    description: 'Регламент, инструкция, изменение правил'
  },
  {
    id: '5',
    path: 'collections/user-icon.svg',
    title: 'Сотрудник',
    description: 'Новый человек, назначение, изменение роли'
  },
  {
    id: '6',
    path: 'collections/folder-closed-icon.svg',
    title: 'Проект',
    description: 'Команда, доступ, подключение к проекту'
  },
  {
    id: '7',
    path: 'collections/pie-chart-icon.svg',
    title: 'Отчет',
    description: 'Результаты опроса, аналитика, показатели'
  },
  {
    id: '8',
    path: 'collections/envelope-icon.svg',
    title: 'Сообщение',
    description: 'Личное обращение, приглашение, ответ'
  },
  {
    id: '9',
    path: 'collections/settings-icon.svg',
    title: 'Система',
    description: 'Обновления, работы, техническое'
  },
  {
    id: '10',
    path: 'collections/party-icon.svg',
    title: 'Праздники',
    description: 'Поздравление, новость, анонс'
  }
];

export default function IconSelect() {
  const { selectedApp, setSelectedIcon } = useSelectingRecipientApp();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [draftIcon, setDraftIcon] = useState<SelectedAppIcon | null>(null);

  const SelectedIcon = selectedApp?.icon.Icon;
  const isCustomIcon = selectedApp
    ? selectedApp.icon.id !== selectedApp.standartIcon.id
    : false;
  const openIconModal = () => {
    setDraftIcon(selectedApp?.icon ?? COLLECTION_ICONS[0] ?? null);
    onOpen();
  };

  return (
    <Box
      display={'flex'}
      flexDirection={'column'}
      gap={1.5}
    >
      <Text
        fontSize="lg"
        color="#12233F"
      >
        Иконка уведомления
      </Text>
      <Box
        data-tour="icon-select"
        display={'flex'}
        flexDirection={'column'}
        alignItems={'flex-start'}
        gap={selectedApp ? 4 : 0}
        py={2.5}
        px={4}
        h={'auto'}
        w={'full'}
        whiteSpace={'normal'}
        bg="#F8FAFC"
        borderRadius="10px"
        border="1px solid"
        borderColor="#E2EBF3"
      >
        {selectedApp ? (
          <>
            <Box
              display={'flex'}
              alignItems={'center'}
              gap={4}
            >
              <Box
                display={'grid'}
                placeItems={'center'}
                w={12}
                h={12}
                borderRadius={'xl'}
                bg={getIconBackgroundColor(
                  selectedApp.iconColor,
                  selectedApp.bgIconColor
                )}
                flexShrink={0}
              >
                <Box
                  display={'grid'}
                  placeItems={'center'}
                  w={6}
                  h={6}
                >
                  {selectedApp.icon.path ? (
                    <CollectionIcon
                      icon={selectedApp.icon}
                      size={15}
                      color={selectedApp.iconColor}
                    />
                  ) : SelectedIcon ? (
                    <SelectedIcon color={selectedApp.iconColor} />
                  ) : null}
                </Box>
              </Box>
              <Box>
                <Text
                  color={'#12233F'}
                  fontSize={'md'}
                  lineHeight={4}
                  mb={1}
                >
                  {selectedApp.icon.title}
                </Text>
                <Text
                  color={'#A1A1AA'}
                  fontSize={'xs'}
                  lineHeight={4}
                >
                  {selectedApp.icon.description}
                </Text>
              </Box>
            </Box>
            <Flex gap={2}>
              <Button
                variant={'outline'}
                borderRadius={'xl'}
                border={'1px solid #2D547B'}
                color={'#2D547B'}
                fontWeight={500}
                fontSize={'xs'}
                whiteSpace={'normal'}
                h={'unset'}
                minH={'unset'}
                lineHeight={'1em'}
                py={2}
                px={2.5}
                onClick={openIconModal}
              >
                {isCustomIcon ? 'Заменить' : 'Выбрать из коллекции'}
              </Button>
              {isCustomIcon && (
                <Button
                  variant={'outline'}
                  borderRadius={'xl'}
                  border={'1px solid #2D547B'}
                  color={'#EF4444'}
                  fontWeight={500}
                  fontSize={'xs'}
                  whiteSpace={'normal'}
                  h={'unset'}
                  minH={'unset'}
                  lineHeight={'1em'}
                  py={2}
                  px={2.5}
                  onClick={() => setSelectedIcon(selectedApp.standartIcon)}
                >
                  Убрать
                </Button>
              )}
            </Flex>
            <SelectIconModal
              isOpen={isOpen}
              onClose={onClose}
              icons={COLLECTION_ICONS}
              draftIcon={draftIcon}
              onDraftIconChange={setDraftIcon}
            />
          </>
        ) : (
          <>
            <Text
              color={'#A1A1AA'}
              fontSize={'md'}
              fontWeight={'normal'}
              textAlign={'left'}
            >
              Сначала выберите приложение.
            </Text>
            <Text
              color={'#A1A1AA'}
              fontSize={'md'}
              fontWeight={'normal'}
              textAlign={'left'}
            >
              Иконка оформляется в стиле приложения
            </Text>
          </>
        )}
      </Box>
      <Text
        color={'#52525B'}
        fontSize={'xs'}
        fontWeight={'normal'}
        textAlign={'left'}
      >
        Выбор иконки необязателен
      </Text>
    </Box>
  );
}
