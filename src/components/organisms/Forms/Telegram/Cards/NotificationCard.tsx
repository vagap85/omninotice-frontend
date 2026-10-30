import Appendix from '@/components/atoms/Icons/Appendix';
import { useTelegramNotification } from '@/components/organisms/Forms/Telegram/Contexts/TelegramNotificationContext';
import { Box, Flex, Text } from '@chakra-ui/react';

export default function TelegrNotificationCard() {
  const { messageHtml, buttonText } = useTelegramNotification();
  const messageContent = messageHtml || 'Текст сообщения появится здесь';
  const button = buttonText || 'Текст кнопки';

  return (
    <Flex
      bg={'#F8FAFC'}
      p={4}
      borderRadius={'10px'}
      flexDirection={'column'}
    >
      <Box
        bg={'white'}
        position={'relative'}
        borderRadius={'15px 15px 15px 0'}
        px={2}
        py={1.5}
      >
        <Box
          position={'absolute'}
          bottom={0}
          left={'-6px'}
        >
          <Appendix />
        </Box>
        <Text
          whiteSpace="pre-wrap"
          dangerouslySetInnerHTML={{ __html: messageContent }}
        />
      </Box>
      <Flex
        alignItems={'center'}
        justifyContent={'center'}
        borderRadius={'6px 6px 15px 15px'}
        bg={'#2563EB'}
        color={"white"}
        p={3}
        fontSize={"14px"}
        fontWeight={"medium"}
        lineHeight={"1em"}
      >
        {button}
      </Flex>
    </Flex>
  );
}
