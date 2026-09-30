import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import authBg from '@/assets/background.jpg';
import { DashedCircularArrow } from '@/components/atoms/Icons/DashedCircularArrow';
import CustomButton from '@/components/atoms/Button/CustomButton';

export function NotFoundPage() {
  return (
    <Flex
      minH={'100vh'}
      alignItems={'center'}
      justifyContent={'center'}
      px={4}
      flexDirection={'column'}
    >
      <Box
        aria-hidden
        position="absolute"
        inset={0}
        zIndex={-1}
        bgImage={`url("${authBg}")`}
        bgSize="cover"
        bgPosition="center"
        bgRepeat="no-repeat"
        minW="100%"
        minH="100%"
      />
      <Flex
        flexDirection={'column'}
        gap={5}
        mb={'clamp(32px, 3vw, 45px)'}
      >
        <Flex
          gap={5}
          justifyContent={'center'}
        >
          <Text
            fontWeight={'bold'}
            fontSize={'160px'}
            lineHeight={'0.58em'}
          >
            4
          </Text>
          <DashedCircularArrow />
          <Text
            fontWeight={'bold'}
            fontSize={'160px'}
            lineHeight={'0.58em'}
          >
            4
          </Text>
        </Flex>
        <Heading
          as={'h1'}
          fontWeight={'regular'}
          fontSize={'clamp(52px, 4.5vw, 82px)'}
          textAlign={'center'}
          lineHeight={"72px"}
        >
          Страница не найдена
        </Heading>
        <Text
          color={'#52525B'}
          textAlign={'center'}
          fontSize={"21px"}
          lineHeight={"30px"}
        >
          Ссылка устарела или в адресе опечатка. Проверьте адрес или вернитесь
          на главную.
        </Text>
      </Flex>
      <Flex gap={"clamp(12px, 1.2vw, 20px)"} flexWrap={"wrap"} justifyContent={"center"}>
        <CustomButton
          as={'a'}
          href="/"
          variant={'outline'}
          fontWeight={500}
          px={5}
        >
          На главную
        </CustomButton>
        <CustomButton
          as={'a'}
          href="/create/email"
          px={5}
        >
          Создать рассылку
        </CustomButton>
      </Flex>
    </Flex>
  );
}
