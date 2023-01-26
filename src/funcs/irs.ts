import { Echelon, EchelonScale } from "@/models/echelon";
import irs2023 from "@/data/irs-2023-2.json";

export const getEchelon = (married: boolean, holders: number, dependents: number): Echelon | null | undefined => {
  console.log(married, holders, dependents)
  return irs2023.find(echelon => {
    return echelon.status.some(stt => stt.married === married && stt.holders === holders && (
      stt.dependents === dependents || (stt.dependents < dependents && stt.allowMoreDependents)
    ));
  }) as Echelon | null | undefined;
}

export const getEmptyEchelonScale = (): EchelonScale => {
  return { maxSalary: 0, maxMarginalRate: 0, deduction: 0 };
}

export const getScale = (echelon: Echelon, salary: number) => {
  return echelon.scales.reduce((prev, curr) =>
    prev.maxSalary < salary && curr.maxSalary >= salary ? curr : prev, getEmptyEchelonScale());
}

export const getIrsDeductionAmount = (baseSalary: number, dependents: number, scale: EchelonScale | null): number | null => {
  if (scale) {
    const maxMarginalRate = scale.maxMarginalRate / 100;
    const dependentDeduction = scale.dependentDeduction ?? 0;
    const deduction = scale.deductionCoefficient != null ? maxMarginalRate * scale.deductionCoefficient * (scale.deduction - baseSalary) : scale.deduction;
    console.log(`${baseSalary} * ${maxMarginalRate} - ${deduction} - (${dependentDeduction} * ${dependents})`);
    return baseSalary * maxMarginalRate - deduction - (dependentDeduction * dependents);
  }
  return null;
}