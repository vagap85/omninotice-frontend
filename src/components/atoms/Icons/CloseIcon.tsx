import type { IconProps } from '@/components/atoms/types/types'

export default function CloseIcon({ width = 10, height = 10, color = "currentColor" }: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0.5 0.5L5 5M5 5L0.5 9.5M5 5L9.5 9.5M5 5L9.5 0.5" stroke={color} strokeLinecap="round" strokeLinejoin="round" />
        </svg>

    )
}
