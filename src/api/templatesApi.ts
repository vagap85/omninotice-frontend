import { MOCK_TEMPLATES } from '../mocks/templates';
import { NotificationTemplate } from '../types/template';

export const getTemplates = async (): Promise<NotificationTemplate[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TEMPLATES);
    }, 200);
  });
};

export const getTemplateById = async (
  id: string
): Promise<NotificationTemplate | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_TEMPLATES.find((tpl) => tpl.id === id));
    }, 100);
  });
};
