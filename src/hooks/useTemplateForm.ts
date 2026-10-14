import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { MOCK_TEMPLATES } from '@/mocks/templates';
import { NotificationTemplate } from '@/types/template';

interface TemplateFormState {
  title: string;
  text: string;
  buttonText: string;
  buttonLink: string;
}

export function useTemplateForm() {
  const [searchParams] = useSearchParams();
  const initialTemplateId = searchParams.get('templateId') || '';
  const initialTemplate = MOCK_TEMPLATES.find(
    (t) => t.id === initialTemplateId
  );

  const [formState, setFormState] = useState<TemplateFormState>({
    title: initialTemplate?.title || '',
    text: initialTemplate?.body || '',
    buttonText: initialTemplate?.buttonText || '',
    buttonLink: ''
  });

  const handleTemplateSelect = (template: NotificationTemplate | null) => {
    if (template) {
      setFormState({
        title: template.title,
        text: template.body,
        buttonText: template.buttonText || '',
        buttonLink: ''
      });
    } else {
      setFormState({
        title: '',
        text: '',
        buttonText: '',
        buttonLink: ''
      });
    }
  };

  const updateField = (field: keyof TemplateFormState, value: string) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  return {
    formState,
    updateField,
    handleTemplateSelect
  };
}
