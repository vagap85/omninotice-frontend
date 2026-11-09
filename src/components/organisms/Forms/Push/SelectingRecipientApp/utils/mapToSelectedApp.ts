import type { SelectedApp, SelectingApp } from '../types/types';

export function mapToSelectedApp(app: SelectingApp): SelectedApp {
  return {
    project_id: app.project_id,
    title: app.title,
    color: app.color
  };
}
