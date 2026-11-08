import type { ConnectedApp } from '@/api/vishenka';
import type { SelectedApp } from '../types/types';

export function mapToSelectedApp(app: ConnectedApp): SelectedApp {
  return {
    project_id: app.project_id,
    title: app.title,
    color: app.color
  };
}
