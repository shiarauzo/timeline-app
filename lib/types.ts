export interface TimelineEvent {
  id: string;
  year: string;
  title: string;
  description: string;
  timestamp?: number;
  dateConfirmed: boolean;
  position?: { x: number; y: number };
}
