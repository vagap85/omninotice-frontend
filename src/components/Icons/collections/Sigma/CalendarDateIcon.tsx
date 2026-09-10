import type { IconProps } from "../../types";

export default function CalendarDateIcon({ width = 15, height = 15, color = "currentColor" }: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M13.5625 5.02163H0.5M4.01683 2.50962V0.5M10.0457 2.50962L10.0457 0.5M3.51442 8.03606H4.51923M6.52885 8.03606H7.53365M9.54327 8.03606H10.5481M3.51442 10.5481H4.51923M6.52885 10.5481H7.53365M9.54327 10.5481H10.5481M0.5 3.51443L0.5 11.5529C0.5 12.6628 1.39973 13.5625 2.50962 13.5625L11.5529 13.5625C12.6628 13.5625 13.5625 12.6628 13.5625 11.5529V3.51444C13.5625 2.40457 12.6628 1.50483 11.5529 1.50483L2.50962 1.50481C1.39974 1.50481 0.5 2.40455 0.5 3.51443Z"
                stroke={color} strokeLinecap="round" />
        </svg>
    )
}