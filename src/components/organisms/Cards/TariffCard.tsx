import { Box, Text, VStack } from "@chakra-ui/react";

import CustomButton from "@/components/atoms/Button/CustomButton";
import TariffCardFeature from "@/components/molecules/TariffCardFeature/TariffCardFeature";

import { TariffCardProps } from "../types/types";



export default function TariffCard({
    isHighlighted,
    title,
    subtitle,
    features
}: TariffCardProps) {
    return (
        <Box
            as="article"
            key={title}
            borderRadius="24px"
            border={isHighlighted ? "none" : "1px solid #DCE3EA"}
            bg={isHighlighted ? "#3F73A8" : "#F7F7F8"}
            color={isHighlighted ? "white" : "#12233F"}
            p={{ base: 6, md: 8 }}
            minH={isHighlighted ? "560px" : "520px"}
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
            alignItems={"center"}
            boxShadow={
                isHighlighted
                    ? "0 12px 40px rgba(63,115,168,0.25)"
                    : "none"
            }
        >
            <VStack align="start" spacing={9}>
                <VStack align="center" spacing={1} w="100%">
                    <Text
                        fontSize="36px"
                        lineHeight="42px"
                        fontWeight="500"
                        textAlign="center"
                    >
                        {title}
                    </Text>

                    <Text
                        fontSize="15ox"
                        color={
                            isHighlighted ? "rgba(255,255,255,0.8)" : "#6B7280"
                        }
                        textAlign={"center"}
                    >
                        {subtitle}
                    </Text>
                </VStack>

                <VStack align="start" spacing={3}>
                    {features.map(({ text, isDisabled }) => (
                        <TariffCardFeature
                            key={text + isDisabled}
                            text={text}
                            isDisabled={isDisabled}
                            isHighlighted={isHighlighted}
                        />
                    ))}
                </VStack>
            </VStack>

            <CustomButton
                as={"a"}
                href="/create/email"
                mt={10}
                w="100%"
                maxW={"unset"}
                bg={isHighlighted ? "white" : "#3F73A8"}
                color={isHighlighted ? "#3F73A8" : "white"}
                _hover={{
                    opacity: 0.9,
                }}
            >
                Узнать больше
            </CustomButton>
        </Box>
    )
}
