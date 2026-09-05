export interface ActionSectionProps {
    buttonText: string;
    onButtonTextChange: (value: string) => void;
    buttonLink: string;
    onButtonLinkChange: (value: string) => void;
    isLinkValid: boolean;
}

export interface NotificationContentSectionProps {
    title: string;
    onTitleChange: (value: string) => void;
    text: string;
    onTextChange: (value: string) => void;
}