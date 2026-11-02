import type { NotificationTemplate } from '@/types/template';

let cachedTemplates: NotificationTemplate[] | null = null;

function getCookie(name: string): string | null {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) {
      return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
  }
  return null;
}

export async function getTemplates(
  forceRefresh = false
): Promise<NotificationTemplate[]> {
  if (cachedTemplates && !forceRefresh) {
    return cachedTemplates;
  }

  const baseUrl = import.meta.env.VITE_VISHENKA_BASE_URL;
  const projectId = import.meta.env.VITE_SYNORA_PROJECT_ID;

  if (!baseUrl) throw new Error('VITE_VISHENKA_BASE_URL не задан в .env');
  if (!projectId) throw new Error('VITE_SYNORA_PROJECT_ID не задан в .env');

  const token = getCookie('omni_access_token');

  if (!token) {
    throw new Error('Токен авторизации не найден. Пожалуйста, авторизуйтесь.');
  }

  const response = await fetch(`${baseUrl}/api/v1/templates`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Project-ID': projectId,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Ошибка авторизации. Проверьте токен.');
    }
    throw new Error(
      `Ошибка загрузки шаблонов: ${response.status} ${response.statusText}`
    );
  }

  const json = await response.json();
  const data = (json.data || []) as NotificationTemplate[];

  cachedTemplates = data;

  return data;
}
