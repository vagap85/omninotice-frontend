import { Box, Flex, Heading, VStack } from '@chakra-ui/react';
import { LuSparkles } from 'react-icons/lu';

import CustomButton from '@/components/atoms/Button/CustomButton';
import { FormTextAreaField } from '@/components/molecules/Form/Elements/FormTextAreaField';
import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { httpUrl } from '@/components/molecules/Form/validators/validators';

import { EmailMainFieldsProps } from '../../types/types';

export default function EmailMainFields({ canImprove, initialValues = {} }: EmailMainFieldsProps) {
    return (
        <>
            <Box
                as='fieldset'
                bg="white"
                borderRadius="10px"
                p={6}
                maxW="900px"
                mx="auto"
                mt={5}
            >
                <Heading size="md" mb={4}>Текст письма</Heading>
                <VStack align="stretch" spacing={5}>
                    <FormTextField
                        name="messageTitle"
                        label="Заголовок письма"
                        placeholder="Добрый день! Подготовили для вас специальное предложение"
                        subTitlte='Начало текста письма, будет отображаться более крупно и заметно'
                        initialValue={initialValues.messageTitle}
                    />

                    <FormTextAreaField
                        name="body"
                        label="Основная часть письма"
                        placeholder="Введите текст рассылки"
                        minH="160px"
                        initialValue={initialValues.body}
                    />

                    <FormTextAreaField
                        name="signature"
                        label="Подпись"
                        placeholder="Здесь можно указать название компании и контакты для обратной связи"
                        minH="100px"
                        initialValue={initialValues.signature}
                    />

                    <Flex justify="flex-end">
                        <CustomButton
                            leftIcon={<LuSparkles />}
                            bg={canImprove ? "#00C496" : "gray.300"}
                            color="white"
                            borderRadius="12px"
                            h="auto"
                            py={3}
                            px={6}
                            _hover={canImprove ? { bg: "teal.500" } : {}}
                            onClick={() => { }}
                            loadingText="Обработка..."
                            isDisabled={!canImprove}
                            whiteSpace={"normal"}
                            lineHeight={"1.5em"}
                        >
                            Улучшить текст
                        </CustomButton>
                    </Flex>
                </VStack>
            </Box>

            <Box
                as='fieldset'
                bg="white"
                borderRadius="10px"
                p={6}
                maxW="900px"
                mx="auto"
                mt={4}>
                <Heading size="md" mb={4}>Действие</Heading>
                <VStack align="stretch" spacing={5}>
                    <FormTextField
                        name="actionText"
                        label="Текст кнопки"
                        placeholder="Например, перейти на сайт"
                        maxLength={18}
                        initialValue={initialValues.actionText}
                    />
                    <FormTextField
                        name="actionLink"
                        label="Ссылка для кнопки"
                        placeholder="Вставьте ссылку"
                        initialValue={initialValues.actionLink}
                        validators={[httpUrl('Проверьте ссылку и укажите валидный URL в формате http(s)://...')]}
                    />
                </VStack>
            </Box>
        </>
    );
}