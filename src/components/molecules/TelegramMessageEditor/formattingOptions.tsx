export const formattingOptions = [
  { label: 'Жирный', format: 'bold', icon: <strong>В</strong> },
  { label: 'Курсив', format: 'italic', icon: <i>/</i> },
  { label: 'Подчёркнутый', format: 'underline', icon: <u>U</u> },
  { label: 'Зачёркнутый', format: 'strike', icon: <s>T</s> },
  { label: 'Моноширинный', format: 'code', icon: <span>M</span> }
] as const;

export type FormattingOption = (typeof formattingOptions)[number]['format'];
export type ActiveFormats = Record<FormattingOption, boolean>;

export const EMPTY_ACTIVE_FORMATS: ActiveFormats = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  code: false
};
