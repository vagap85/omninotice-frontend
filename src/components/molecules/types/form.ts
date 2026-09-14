import { CustomInputProps, CustomTextareaProps } from "@/components/atoms/types/types";
import { ButtonProps } from "@chakra-ui/react";

export type Validator<T = any> = {
  (value: T, allValues: Record<string, any>): string | undefined;
  immediate?: boolean; // если true — валидатор проверяется сразу при вводе, а не только на blur/submit
};

export interface FieldState<T = any> {
  value: T;
  error?: string;
  touched: boolean;
}

export interface FieldConfig<T = any> {
  initialValue?: T;
  validators?: Validator<T>[];
  validateOnChange?: boolean;
}

export type Listener = () => void;

export interface FormStore {
  hasField: (name: string) => boolean;
  registerField: (name: string, config?: FieldConfig) => void;
  unregisterField: (name: string) => void;
  getSnapshot: (name: string) => FieldState;
  subscribe: (name: string, listener: Listener) => () => void;
  subscribeAll: (listener: Listener) => () => void;
  setValue: (name: string, value: any) => void;
  setFieldError: (name: string, error: string | undefined) => void;
  validateField: (name: string) => boolean;
  validateAll: () => boolean;
  handleBlur: (name: string) => void;
  getValues: () => Record<string, any>;
  reset: (values?: Record<string, any>) => void;
}

export interface FormSubmitButtonProps extends Omit<ButtonProps, 'onClick'> {
  formIds: string[];
  onSubmit: (values: Record<string, any>) => void | Promise<void>;
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