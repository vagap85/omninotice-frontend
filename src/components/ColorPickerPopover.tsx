import { useState, useCallback, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'
import {
  Box,
  HStack,
  Input,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  Text,
  VStack,
} from '@chakra-ui/react'
import { hexToRgb, rgbToHex } from '../utils/color'

const clampRgb = (n: number) => Math.min(255, Math.max(0, Math.round(n)))

interface ColorPickerPopoverProps {
  value: string
  onChange: (hex: string) => void
  label?: string
}

export default function ColorPickerPopover({ value, onChange }: ColorPickerPopoverProps) {
  const [hex, setHex] = useState(value)
  const rgb = hexToRgb(hex)
  const [r, setR] = useState(String(rgb.r))
  const [g, setG] = useState(String(rgb.g))
  const [b, setB] = useState(String(rgb.b))

  useEffect(() => {
    setHex(value)
    const next = hexToRgb(value)
    setR(String(next.r))
    setG(String(next.g))
    setB(String(next.b))
  }, [value])

  const handleHexChange = useCallback(
    (newHex: string) => {
      setHex(newHex)
      onChange(newHex)
      const next = hexToRgb(newHex)
      setR(String(next.r))
      setG(String(next.g))
      setB(String(next.b))
    },
    [onChange]
  )

  const commitRgbFromInputs = useCallback(() => {
    const rr = clampRgb(parseInt(r, 10) || 0)
    const gg = clampRgb(parseInt(g, 10) || 0)
    const bb = clampRgb(parseInt(b, 10) || 0)
    setR(String(rr))
    setG(String(gg))
    setB(String(bb))
    const newHex = rgbToHex(rr, gg, bb)
    setHex(newHex)
    onChange(newHex)
  }, [r, g, b, onChange])

  return (
    <Popover placement="bottom-start" isLazy>
      <PopoverTrigger>
        <HStack
          spacing={3}
          cursor="pointer"
          p={2}
        >
          <Box
            w={8}
            h={8}
            borderRadius="full"
            bg={hex}
            borderWidth="2px"
            borderColor="lavender.300"
            flexShrink={0}
          />
          <Text fontFamily="mono" fontSize="sm" color="gray.700">
            {hex}
          </Text>
        </HStack>
      </PopoverTrigger>
      <PopoverContent w="auto" borderColor="lavender.200" boxShadow="lg" _focusVisible={{ outline: 'none' }}>
        <PopoverBody p={4}>
          <VStack align="stretch" spacing={3}>
           
            
            <Box
              sx={{
                '.react-colorful': { width: '100%' },
                '.react-colorful__saturation': { borderRadius: 'md', mb: 2 },
                '.react-colorful__hue': { height: '12px', borderRadius: 'full' },
              }}
            >
              <HexColorPicker color={hex} onChange={handleHexChange} style={{ width: '220px' }} />
            </Box>
            <HStack spacing={2} align="flex-end">
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  R
                </Text>
                <Input
                  size="sm"
                  w="56px"
                  type="number"
                  min={0}
                  max={255}
                  value={r}
                  onChange={(e) => setR(e.target.value)}
                  onBlur={commitRgbFromInputs}
                  onKeyDown={(e) => e.key === 'Enter' && commitRgbFromInputs()}
                />
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  G
                </Text>
                <Input
                  size="sm"
                  w="56px"
                  type="number"
                  min={0}
                  max={255}
                  value={g}
                  onChange={(e) => setG(e.target.value)}
                  onBlur={commitRgbFromInputs}
                  onKeyDown={(e) => e.key === 'Enter' && commitRgbFromInputs()}
                />
              </Box>
              <Box>
                <Text fontSize="xs" color="gray.500" mb={1}>
                  B
                </Text>
                <Input
                  size="sm"
                  w="56px"
                  type="number"
                  min={0}
                  max={255}
                  value={b}
                  onChange={(e) => setB(e.target.value)}
                  onBlur={commitRgbFromInputs}
                  onKeyDown={(e) => e.key === 'Enter' && commitRgbFromInputs()}
                />
              </Box>
            </HStack>
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
}
