import type { IconProps } from '@/components/atoms/types/types'

export default function StatsCursorIcon({ width = 33, height = 35 }: IconProps) {
    return (
        <svg width={width} height={height} viewBox="0 0 32.9611 34.889" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
                <g filter="url(#filter0_d_0_658)">
                    <path d="M10.141 23.344L14.71 16.713L23.196 14.06L6.22503 4.445L10.141 23.344Z" fill="black" stroke="black" strokeWidth="1.77" strokeLinecap="round" strokeLinejoin="round" />
                </g>
                <path d="M10.141 23.344L14.71 16.713L23.196 14.06L6.22503 4.445L10.141 23.344Z" fill="#121212" stroke="#FFF5F5" strokeWidth="1.77" strokeLinecap="round" strokeLinejoin="round" />
            </g>
            <defs>
                <filter id="filter0_d_0_658" x="1.19209e-07" y="-5.96046e-08" width="32.9611" height="34.889" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <feFlood floodOpacity="0" result="BackgroundImageFix" />
                    <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <feOffset dx="1.77" dy="3.55" />
                    <feGaussianBlur stdDeviation="3.555" />
                    <feColorMatrix type="matrix" values="0 0 0 0 0.898 0 0 0 0 0.898 0 0 0 0 0.898 0 0 0 0.12 0" />
                    <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_0_658" />
                    <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_0_658" result="shape" />
                </filter>
            </defs>
        </svg>
    )
}
