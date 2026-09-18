import { Box, Stack, Text } from "@chakra-ui/react";

import { FeatureCardProps } from "../types/types";

export default function FeatureCard({
    icon,
    title,
    description
}: FeatureCardProps) {
    return (
        <Box
            as="article"
            bg="white"
            border="1px solid #E2EBF3"
            borderRadius="24px"
            p={6}
        >
            {icon}
            <Stack spacing={2} mt={6}>
                <Text
                    fontSize="20px"
                    lineHeight="30px"
                    fontWeight="600"
                    color="#12233F"
                >
                    {title}
                </Text>
                <Text fontSize="16px" lineHeight="24px" color="#52525B">
                    {description}
                </Text>
            </Stack>
        </Box>
    )
}
