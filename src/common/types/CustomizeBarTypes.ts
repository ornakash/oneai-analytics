import { ReactElement } from 'react';

export interface CounterType {
  counterConfiguration: CounterConfiguration | null;
  counterType: CalculationTypes;
}

export interface CountersConfiguration {
  [key: string]: CounterConfiguration;
}

export interface CounterConfiguration {
  label?: string;
  display?: DisplayConfig;
  members?: GroupMembers[];
  groups?: CounterConfiguration[];
}

export interface GroupMembers {
  metadataName?: string;
  values?: string[];
}

export interface DisplayConfig {
  color: 'green' | 'red' | 'white';
  icon: ReactElement | null;
}

export interface CalculationTypes {
  name:
    | 'Total SUM'
    | 'Top value total sum'
    | 'top value %'
    | 'top group total'
    | 'top group %';
  type: 'number' | 'percentage';
  hasGroups: boolean;
}
