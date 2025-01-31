export interface Echelon {
  title: string;
  description: string;
  status: EchelonStatus[];
  scales: EchelonScale[];
}

export interface EchelonStatus {
  married: boolean;
  holders: number;
  dependents: number;
  allowMoreDependents: boolean;
  handicapped?: boolean;
}

export interface EchelonScale {
  maxSalary: number;
  maxMarginalRate: number;
  deduction: number;
  dependentDeduction?: number;
  fixedDeduction?: number;
  deductionCoefficient?: number;
  effectiveRate?: number;
}