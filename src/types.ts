import { DateRange } from './logic/state';

export type SelectionMode = 'single' | 'range';

export interface PresetContext {
  today: Date;
  firstDayOfWeek: number;
  min?: Date;
  max?: Date;
}

export interface PresetDefinition {
  key: string;
  label: string;
  expression: string;
}

export interface VisualPersistedState {
  ranges: DateRange[];
  presetKey: string;
  displayMode: 'popup' | 'canvas';
  selectionMode: SelectionMode;
  allowMultiple: boolean;
  firstDayOfWeek: number;
  version: number;
}

export interface PersistedPayload
  extends Omit<VisualPersistedState, 'ranges'> {
  ranges: Array<{ start: string; end: string }>;
}
