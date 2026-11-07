import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import EditableTextWithVariables from '@/components/molecules/EditableTextWithVariables/EditableTextWithVariables';

import { renderWithProviders } from '../../../test/utils';

describe('EditableTextWithVariables', () => {
  it('allows editing variables and text beyond the recommended length', () => {
    const text = 'Long text {{name}} rest';
    const onTextChange = vi.fn();
    const onTextInput = vi.fn();
    const onVariableChange = vi.fn();
    const { container } = renderWithProviders(
      <EditableTextWithVariables
        text={text}
        variableValues={{ name: '' }}
        onVariableChange={onVariableChange}
        onTextChange={onTextChange}
        onTextInput={onTextInput}
        maxLength={3}
      />
    );
    const variableInput = container.querySelector('input') as HTMLInputElement;
    const firstTextPart = container.querySelector(
      '[contenteditable="true"]'
    ) as HTMLSpanElement;

    fireEvent.change(variableInput, { target: { value: 'A variable value' } });
    expect(onVariableChange).toHaveBeenCalledWith('name', 'A variable value');

    firstTextPart.innerText = 'A much longer text';
    fireEvent.input(firstTextPart);
    expect(screen.getByText('19/3')).toBeInTheDocument();
    expect(onTextInput).toHaveBeenCalledWith('A much longer text{{name}} rest');
    fireEvent.blur(firstTextPart);

    expect(onTextChange).toHaveBeenCalledWith(
      'A much longer text{{name}} rest'
    );
    expect(firstTextPart.innerText).toBe('A much longer text');
    expect(firstTextPart.innerText).not.toContain(text);
  });
});
