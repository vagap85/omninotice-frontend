import { describe, test, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import {
  FormProvider,
  FormsRegistryProvider,
  useFormStore,
  useFormsRegistry,
} from '@/components/molecules/Form/FormContext';

describe('FormContext', () => {
  describe('FormsRegistryProvider', () => {
    test('useFormsRegistry возвращает реестр внутри провайдера', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormsRegistryProvider>{children}</FormsRegistryProvider>
      );
      const { result } = renderHook(() => useFormsRegistry(), { wrapper });
      expect(result.current).toBeDefined();
      expect(result.current.getOrCreateStore).toBeDefined();
    });

    test('useFormsRegistry бросает ошибку вне провайдера', () => {
      expect(() => renderHook(() => useFormsRegistry())).toThrow(
        /FormsRegistryProvider/i
      );
    });
  });

  describe('useFormStore', () => {
    test('возвращает store внутри FormProvider', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormsRegistryProvider>
          <FormProvider formId="test">{children}</FormProvider>
        </FormsRegistryProvider>
      );
      const { result } = renderHook(() => useFormStore(), { wrapper });
      expect(result.current).toBeDefined();
      expect(result.current.setValue).toBeDefined();
    });

    test('принимает explicitFormId', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormsRegistryProvider>{children}</FormsRegistryProvider>
      );
      const { result } = renderHook(() => useFormStore('explicit'), { wrapper });
      expect(result.current).toBeDefined();
    });

    test('бросает ошибку без formId', () => {
      const wrapper = ({ children }: { children: ReactNode }) => (
        <FormsRegistryProvider>{children}</FormsRegistryProvider>
      );
      expect(() => renderHook(() => useFormStore(), { wrapper })).toThrow(
        /formId/i
      );
    });
  });
});