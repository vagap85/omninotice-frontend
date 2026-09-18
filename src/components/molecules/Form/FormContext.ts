import { createContext } from 'react';

import { FormsRegistry } from '../types/form';

export const FormsRegistryContext = createContext<FormsRegistry | null>(null);
export const FormIdContext = createContext<string | null>(null);