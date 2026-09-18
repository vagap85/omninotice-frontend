import type { IconProps } from '@/components/atoms/types/types'

export default function CardZapIcon({ width = 27, height = 30, color = "#3B6EA0" }: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 27 29.6668" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.8334 1.50008L1.50002 17.5001H13.5L12.1667 28.1668L25.5 12.1668H13.5L14.8334 1.50008Z" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
