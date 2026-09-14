import type { IconProps } from '@/components/atoms/types/types'

export default function ArrowRightIcon({ width = 14, height = 14, color = "white" }: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 13.6667 13.6667" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 6.83333H12.6667M12.6667 6.83333L6.83333 1M12.6667 6.83333L6.83333 12.6667" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
