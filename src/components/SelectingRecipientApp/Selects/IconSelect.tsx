import { Box, Button, Flex, Text, useDisclosure } from '@chakra-ui/react'
import { useSelectingRecipientApp } from '../Providers/SelectingRecipientApp.provider'
import SelectIconModal from '../Modals/SelectIconModal'
/** === ИКОНКИ === */
import BellRingIcon from '../../Icons/collections/Sigma/BellRingIcon'
import CalendarDateIcon from '../../Icons/collections/Sigma/CalendarDateIcon'
import CheckIcon from '../../Icons/collections/Sigma/CheckIcon'
import InformationIcon from '../../Icons/collections/Sigma/InformationIcon'
import AboutIcon from '../../Icons/collections/Sigma/AboutIcon'
import UserIcon from '../../Icons/collections/Sigma/UserIcon'
import FolderClosedIcon from '../../Icons/collections/Sigma/FolderClosedIcon'
import PieChartIcon from '../../Icons/collections/Sigma/PieChartIcon'
import EnvelopeIcon from '../../Icons/collections/Sigma/EnvelopeIcon'
import SettingsIcon from '../../Icons/collections/Sigma/SettingsIcon'
import PartyIcon from '../../Icons/collections/Sigma/PartyIcon'

import type { SelectedAppIcon } from '../types/types'

const COLLECTION_ICONS: SelectedAppIcon[] = [
    {
        id: "0",
        Icon: BellRingIcon,
        title: "Стандартная",
        description: "Если не выбрать другую, получатель увидит эту",
    },
    {
        id: "1",
        Icon: CalendarDateIcon,
        title: "Дата и срок",
        description: "Отпуск, встреча, дедлайн, начало и конец периода",
    },
    {
        id: "2",
        Icon: CheckIcon,
        title: "Готово",
        description: "Согласовано, завершено, заявка одобрена",
    },
    {
        id: "3",
        Icon: InformationIcon,
        title: "Важное",
        description: "Требует действия или внимания в срок",
    },
    {
        id: "4",
        Icon: AboutIcon,
        title: "Справка",
        description: "Регламент, инструкция, изменение правил",
    },
    {
        id: "5",
        Icon: UserIcon,
        title: "Сотрудник",
        description: "Новый человек, назначение, изменение роли",
    },
    {
        id: "6",
        Icon: FolderClosedIcon,
        title: "Проект",
        description: "Команда, доступ, подключение к проекту",
    },
    {
        id: "7",
        Icon: PieChartIcon,
        title: "Отчет",
        description: "Результаты опроса, аналитика, показатели",
    },
    {
        id: "8",
        Icon: EnvelopeIcon,
        title: "Сообщение",
        description: "Личное обращение, приглашение, ответ",
    },
    {
        id: "9",
        Icon: SettingsIcon,
        title: "Система",
        description: "Обновления, работы, техническое",
    },
    {
        id: "10",
        Icon: PartyIcon,
        title: "Праздники",
        description: "Поздравление, новость, анонс",
    },
]

export default function IconSelect() {
    const { selectedApp, setSelectedIcon } = useSelectingRecipientApp()
    const { isOpen, onOpen, onClose } = useDisclosure()
    
    const SelectedIcon = selectedApp?.icon.Icon
    const isCustomIcon = selectedApp
        ? selectedApp.icon.id !== selectedApp.standartIcon.id
        : false;

    return (
        <Box
            display={"flex"}
            flexDirection={"column"}
            gap={1.5}
        >
            <Text fontSize="lg" color="#12233F">
                Иконка уведомления
            </Text>
            <Box
                display={"flex"}
                flexDirection={"column"}
                alignItems={"flex-start"}
                gap={selectedApp ? 4 : 0}
                py={2.5}
                px={4}
                h={"auto"}
                w={"full"}
                whiteSpace={"normal"}
                bg="#F8FAFC"
                borderRadius="10px"
                border="1px solid"
                borderColor="#E2EBF3"
            >
                {selectedApp ?
                    (
                        <>
                            <Box
                                display={"flex"}
                                alignItems={"center"}
                                gap={4}
                            >
                                <Box
                                    display={"grid"}
                                    placeItems={"center"}
                                    w={12}
                                    h={12}
                                    borderRadius={"xl"}
                                    bg={selectedApp.bgIconColor}
                                    flexShrink={0}
                                >
                                    <Box
                                        display={"grid"}
                                        placeItems={"center"}
                                        w={6}
                                        h={6}
                                    >
                                        {SelectedIcon && (
                                            <SelectedIcon color={selectedApp.iconColor} />
                                        )}
                                    </Box>
                                </Box>
                                <Box>
                                    <Text
                                        color={"#12233F"}
                                        fontSize={"md"}
                                        lineHeight={4}
                                        mb={1}>{
                                            selectedApp.icon.title}
                                    </Text>
                                    <Text
                                        color={"#A1A1AA"}
                                        fontSize={"xs"}
                                        lineHeight={4}>{
                                            selectedApp.icon.description}
                                    </Text>
                                </Box>
                            </Box>
                            <Flex
                                gap={2}
                            >
                                <Button
                                    variant={"outline"}
                                    borderRadius={"xl"}
                                    border={"1px solid #2D547B"}
                                    color={"#2D547B"}
                                    fontWeight={500}
                                    fontSize={"xs"}
                                    whiteSpace={"normal"}
                                    h={"auto"}
                                    py={2}
                                    px={2.5}
                                    onClick={onOpen}
                                >
                                    {isCustomIcon ? "Заменить" : "Выбрать из коллекции"}
                                </Button>
                                {isCustomIcon && (
                                    <Button
                                        variant={"outline"}
                                        borderRadius={"xl"}
                                        border={"1px solid #2D547B"}
                                        color={"#EF4444"}
                                        fontWeight={500}
                                        fontSize={"xs"}
                                        whiteSpace={"normal"}
                                        h={"auto"}
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
                            />
                        </>
                    )
                    : (
                        <>
                            <Text color={"#A1A1AA"} fontSize={"md"} fontWeight={"normal"} textAlign={"left"}>Сначала выберите приложение.</Text>
                            <Text color={"#A1A1AA"} fontSize={"md"} fontWeight={"normal"} textAlign={"left"}>Иконка оформляется в стиле приложения</Text>
                        </>
                    )}
            </Box>
            <Text color={"#52525B"} fontSize={"xs"} fontWeight={"normal"} textAlign={"left"}>
                Выбор иконки необязателен
            </Text>
        </Box>
    )
}
