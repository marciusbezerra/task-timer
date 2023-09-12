export interface Task {
  id: number;
  title: string;
  time: string;
  isRunning: boolean;
  intervalId?: any;
  endTime?: number;
  showPicker?: boolean;
  templateId?: number;
}
