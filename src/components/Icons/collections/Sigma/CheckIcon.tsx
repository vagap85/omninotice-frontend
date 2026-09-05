import type { IconProps } from "../../types";

export default function CheckIcon({ width = 15, height = 15, color = "currentColor" }: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M13.5625 7.03125C13.5625 10.6384 10.6384 13.5625 7.03125 13.5625C3.42414 13.5625 0.5 10.6384 0.5 7.03125C0.5 3.42414 3.42414 0.5 7.03125 0.5C10.6384 0.5 13.5625 3.42414 13.5625 7.03125Z"
                stroke={color} strokeLinecap="round" strokeLinejoin="round" />
            <path
                d="M3.59375 6.34405L6.34375 9.4378L9.93403 4.85449"
                stroke={color} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}