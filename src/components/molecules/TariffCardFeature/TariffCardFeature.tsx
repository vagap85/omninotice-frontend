import { Box, HStack, Text } from "@chakra-ui/react";
import type { TariffCardFeatureProps } from "../types/types";
import { CheckIcon } from "@chakra-ui/icons/Check";

export default function TariffCardFeature({
  text,
  isHighlighted,
  isDisabled
}: TariffCardFeatureProps) {
  const textColor = isDisabled
    ? isHighlighted
      ? "rgba(255, 255, 255, 0.45)"
      : "#9CA3AF"
    : isHighlighted
      ? "white"
      : "#12233F";

  return (
    <HStack align="start" spacing={3}>
      {!isDisabled && (
        <Box
          mt="5px"
          borderRadius="4px"
          bg="#22C55E"
          color="white"
          fontSize="10px"
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
          padding={1}
        >
          <CheckIcon boxSize={3.5}/>
        </Box>
      )}
      <Text
        fontSize="xl"
        lineHeight="30px"
        color={textColor}
        textDecor={isDisabled ? "line-through" : "unset"}
      >
        {text}
      </Text>
    </HStack>
  )
}
