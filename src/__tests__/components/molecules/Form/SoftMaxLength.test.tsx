import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { FormSubmitButton } from '@/components/molecules/Form/Elements/FormSubmitButton';
import { FormTextAreaField } from '@/components/molecules/Form/Elements/FormTextAreaField';
import { FormTextField } from '@/components/molecules/Form/Elements/FormTextField';
import { FormProvider } from '@/components/molecules/Form/Providers/FormProvider';
import { FormsRegistryProvider } from '@/components/molecules/Form/Providers/FormsRegistryProvider';
import { maxLength } from '@/components/molecules/Form/validators/validators';

import { renderWithProviders } from '../../../../test/utils';

describe('softMaxLength form fields', () => {
  it('shows the error without truncating and blocks submit for text fields', () => {
    const onSubmit = vi.fn();
    renderWithProviders(
      <FormsRegistryProvider>
        <FormProvider formId="soft-limit">
          <FormTextField
            name="title"
            label="Title"
            maxLength={3}
            softMaxLength
            validators={[maxLength(3)]}
            initialValue=""
          />
          <FormSubmitButton
            formIds={['soft-limit']}
            onSubmit={onSubmit}
          >
            Submit
          </FormSubmitButton>
        </FormProvider>
      </FormsRegistryProvider>
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'longer than limit' } });

    expect(input).toHaveValue('longer than limit');
    expect(screen.getByText('15/3')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Превышено количество знаков. Уберите лишние, чтобы отправить.'
      )
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the length error for over-limit textarea values', () => {
    renderWithProviders(
      <FormsRegistryProvider>
        <FormProvider formId="soft-limit-area">
          <FormTextAreaField
            name="body"
            label="Body"
            maxLength={3}
            softMaxLength
            initialValue=""
          />
        </FormProvider>
      </FormsRegistryProvider>
    );

    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'longer than limit' } });

    expect(textarea).toHaveValue('longer than limit');
    expect(screen.getByText('15/3')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Превышено количество знаков. Уберите лишние, чтобы отправить.'
      )
    ).toBeInTheDocument();
  });
});
