import { Box, Button, Flex, Text, useDisclosure } from '@chakra-ui/react';
import { useState } from 'react';

import SelectIconModal from '../../../../Modals/SelectIconModal';
import { useSelectingRecipientApp } from '../hooks/useSelectingRecipientApp';
import type { SelectedAppIcon } from '../types/types';
import CollectionIcon from '../utils/CollectionIcon';
import { getIconBackgroundColor } from '../utils/iconBackgroundColor';
import { COLLECTION_ICONS } from '../constants/collectionIcons';

export default function IconSelect() {
  const { selectedApp, selectedIcon, setSelectedIcon } =
    useSelectingRecipientApp();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [draftIcon, setDraftIcon] = useState<SelectedAppIcon | null>(null);

  const SelectedIcon = selectedIcon.Icon;
  const isCustomIcon = selectedIcon.id !== COLLECTION_ICONS[0].id;
  const openIconModal = () => {
    setDraftIcon(selectedIcon);
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
                bg={getIconBackgroundColor(selectedApp.color)}
                flexShrink={0}
              >
                <Box
                  display={'grid'}
                  placeItems={'center'}
                  w={6}
                  h={6}
                >
                  {selectedIcon.path ? (
                    <CollectionIcon
                      icon={selectedIcon}
                      size={15}
                      color={selectedApp.color}
                    />
                  ) : SelectedIcon ? (
                    <SelectedIcon color={selectedApp.color} />
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
                  {selectedIcon.title}
                </Text>
                <Text
                  color={'#A1A1AA'}
                  fontSize={'xs'}
                  lineHeight={4}
                >
                  {selectedIcon.description}
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
                  onClick={() => setSelectedIcon(COLLECTION_ICONS[0])}
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
