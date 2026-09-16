import { ButtonProps } from "@chakra-ui/react";

import { CustomInputProps, CustomTextareaProps } from "@/components/atoms/types/types";

export type Validator<T = unknown> = {
  (value: T, allValues: Record<string, unknown>): string | undefined;
  immediate?: boolean; // если true — валидатор проверяется сразу при вводе, а не только на blur/submit
};

export interface FieldState<T = unknown> {
  value: T;
  error?: string;
  touched: boolean;
}

export interface FieldConfig<T = unknown> {
  initialValue?: T;
  validators?: Validator<T>[];
  validateOnChange?: boolean;
}

export type Listener = () => void;

export interface FormStore {
  hasField: (name: string) => boolean;
  registerField: <T = unknown>(name: string, config?: FieldConfig<T>) => void;
  unregisterField: (name: string) => void;
  getSnapshot: (name: string) => FieldState;
  subscribe: (name: string, listener: Listener) => () => void;
  subscribeAll: (listener: Listener) => () => void;
  setValue: (name: string, value: unknown) => void;
  setFieldError: (name: string, error: string | undefined) => void;
  validateField: (name: string) => boolean;
  validateAll: () => boolean;
  handleBlur: (name: string) => void;
  getValues: <T = Record<string, unknown>>() => T;
  reset: (values?: Record<string, unknown>) => void;
}

export interface FormSubmitButtonProps extends Omit<ButtonProps, 'onClick' | 'onSubmit'> {
  formIds: string[];
  onSubmit: (values: Record<string, unknown>) => void | Promise<void>;
  onUnauthorized?: () => void;
  isAuthorized?: boolean;
  beforeSubmitValidate?: () => boolean;
}

export interface FormTextAreaFieldProps extends Omit<CustomTextareaProps, 'value' | 'onChange' | 'onBlur'> {
  name: string;
  label?: string;
  initialValue?: string;
  validators?: Validator<string>[];
  subTitlte?: string;
  validateOnChange?: boolean;
  maxLengthMessage?: string;
}

export interface FormTextFieldProps extends Omit<CustomInputProps, 'value' | 'onChange' | 'onBlur'> {
  name: string;
  label?: string;
  initialValue?: string;
  validators?: Validator<string>[];
  subTitlte?: string;
  validateOnChange?: boolean;
  maxLengthMessage?: string;
}

export interface FormsRegistry {
  getOrCreateStore: (formId: string) => FormStore;
  getStore: (formId: string) => FormStore | undefined;
}

export interface FormPasswordFieldProps {
  name: string;
  label?: string;
  placeholder?: string;
  initialValue?: string;
  validators?: Validator<string>[];
  onEnter?: () => void;
}