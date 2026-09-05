import type { IconProps } from "../../types";

export default function FolderClosedIcon({ width = 15, height = 15, color = "currentColor" }: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M0.500021 11.1625L0.500021 2.9C0.500021 1.57452 1.57454 0.499999 2.90002 0.5L6.02645 0.5L7.53366 3.01201L11.1625 3.01201C12.488 3.01201 13.5625 4.08653 13.5625 5.41201L13.5625 11.1625C13.5625 12.488 12.488 13.5625 11.1625 13.5625L2.90002 13.5625C1.57454 13.5625 0.50002 12.488 0.500021 11.1625Z"
                stroke={color} />
        </svg>
    )
}