import { ChakraProvider } from '@chakra-ui/react';
import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';

interface WrapperProps {
  children: ReactNode;
}

function AllProviders({ children }: WrapperProps) {
  return (
    <ChakraProvider>
      <MemoryRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        {children}
      </MemoryRouter>
    </ChakraProvider>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react';