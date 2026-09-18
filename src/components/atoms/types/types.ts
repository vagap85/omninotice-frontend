import type { ButtonProps, InputProps, TextareaProps } from "@chakra-ui/react";
import React from "react";

export interface IconProps {
    width?: number;
    height?: number;
    color?: string;
}

export interface CustomButtonProps extends ButtonProps{
    children: React.ReactNode;
    href?: string;
}

export interface CustomTextareaProps extends TextareaProps {
  showCounter?: boolean
}

export interface CustomInputProps extends InputProps {
  showCounter?: boolean
}