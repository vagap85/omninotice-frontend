import type { IconProps } from '@/components/atoms/types/types'

export default function CardLayersIcon({ width = 30, height = 30, color = "#3B6EA0" }: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 29.6673 29.6667" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.50033 21.5L14.8337 28.1667L28.167 21.5M1.50033 14.8333L14.8337 21.5L28.167 14.8333M14.8337 1.5L1.50033 8.16667L14.8337 14.8333L28.167 8.16667L14.8337 1.5Z" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
