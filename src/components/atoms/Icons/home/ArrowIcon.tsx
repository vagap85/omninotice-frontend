import type { IconProps } from '@/components/atoms/types/types'

export default function ArrowIcon({ width = 9, height = 5, color = "#3B6EA0" }: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 9 5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8.09998 4.3501L4.34998 0.600098L0.599976 4.3501" stroke={color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
