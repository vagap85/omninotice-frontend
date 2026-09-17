import { VStack } from '@chakra-ui/react';

import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { required } from '@/components/molecules/Form/validators/validators';

import { EmailThemeFieldsProps } from '../../types/types';

export default function EmailThemeFields({ initialSubject, initialPreheader }: EmailThemeFieldsProps) {
    return (
        <VStack
            as='fieldset'
            align="stretch"
            spacing={5}
            bg="white"
            borderRadius="10px"
            p={6}
            maxW="900px"
            mx="auto"
        >
            <FormTextField
                name="subject"
                label="Тема письма"
                placeholder="Специальное предложение"
                subTitlte='Краткая и понятная тема. Избегайте слов ВСЕМИ ЗАГЛАВНЫМИ.'
                maxLength={70}
                initialValue={initialSubject}
                validators={[required()]}
            />
            <FormTextField
                name="preheader"
                label="Предзаголовок"
                placeholder="Открыв письмо, вы получите персональную скидку"
                subTitlte='Это короткий текст, который отображается рядом с темой письма в почтовом ящике. Не дублируйте тему.
                    Используйте это поле, чтобы добавить важное уточнение или призыв к действию.'
                maxLength={100}
                initialValue={initialPreheader}
                validators={[required()]}
            />
        </VStack>
    );
}