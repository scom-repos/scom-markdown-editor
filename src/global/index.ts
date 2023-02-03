export interface IConfig {
  name: string;
  type: 'config' | 'event';
  config: IConfigSchema;
}

export interface IConfigSchema {
  type: 'integer' | 'number' | 'boolean' | 'string' | 'object';
  format?: 'date' | 'datetime' | 'color' | 'tab';
  enum?: any[];
  required?: string[];
  properties?: {
    [key: string]: IConfigSchema
  };
}

export interface PageBlock {
  // Properties
  getData: () => any;
  setData: (data: any) => Promise<void>;
  getTag: () => any;
  setTag: (tag: any) => Promise<void>
  validate?: () => boolean;
  defaultEdit?: boolean;
  tag?: any;

  // Page Events
  readonly onEdit: () => Promise<void>;
  readonly onConfirm: () => Promise<void>;
  readonly onDiscard: () => Promise<void>;
  // onClear: () => void;

  // Page Block Events
  edit: () => Promise<void>;
  confirm: () => Promise<void>;
  discard: () => Promise<void>;
  config?: () => Promise<void>;
}
