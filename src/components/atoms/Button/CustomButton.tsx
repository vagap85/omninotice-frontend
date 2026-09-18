import { Button } from '@chakra-ui/react'

import type { CustomButtonProps } from '../types/types'

export default function CustomButton({
    children,
    ...rest
}: CustomButtonProps) {
    return (
        <Button
            whiteSpace={"normal"}
            h={"auto"}
            {...rest}
        >
            {children}
        </Button>
    )
}
