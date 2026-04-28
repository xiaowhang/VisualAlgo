export interface ValidationState {
  message: string;
  error: boolean;
}

export interface NumericRange {
  min: number;
  max: number;
}

export interface SortingSectionData {
  sizeRange: NumericRange;
  sizeValidation: ValidationState;
  customValidation: ValidationState;
}

export interface GraphSectionData {
  nodeCountRange: NumericRange;
  sizeValidation: ValidationState;
  nodeOptions: string[];
  generalValidation: ValidationState;
}

export interface TreeSectionData {
  nodeCountRange: NumericRange;
  valueRange: NumericRange;
  sizeValidation: ValidationState;
  valueValidation: ValidationState;
  generalValidation: ValidationState;
}
