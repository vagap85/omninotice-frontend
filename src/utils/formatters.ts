export const formatDate = (isoString: string) => {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export const formatAppName = (appId: string) => {
  const map: Record<string, string> = {
    sigma: 'Сигма',
    crm: 'CRM Система',
    hr_portal: 'HR Портал'
  };
  return map[appId] || appId;
};
