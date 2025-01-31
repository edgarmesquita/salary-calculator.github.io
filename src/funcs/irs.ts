import { Echelon, EchelonScale } from "@/models/echelon";
import irs2025 from "@/data/irs-2025.json";

export const getEchelon = (married: boolean, holders: number, dependents: number, handicapped: boolean): Echelon | null | undefined => {
  console.log(married, holders, dependents, handicapped)
  return irs2025.find(echelon => {
    return echelon.status.some(stt => stt.married === married && stt.holders === holders && stt.handicapped === handicapped && (
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
    const maxMarginalRate = scale.maxMarginalRate;
    const dependentDeduction = scale.dependentDeduction ?? 0;
    const deduction = scale.deductionCoefficient != null ? scale.deduction * scale.deductionCoefficient * (scale.fixedDeduction! - baseSalary) : scale.deduction;
    let amount = (baseSalary * maxMarginalRate) - deduction - (dependentDeduction * dependents);

    if(amount <= 0)
      return null;

    console.log('deduction', scale.deductionCoefficient != null ? `${scale.deduction} * ${scale.deductionCoefficient} * (${scale.fixedDeduction} - ${baseSalary})` : scale.deduction, `= ${deduction}`);
    console.log('calc', `(${baseSalary} * ${maxMarginalRate}) - ${deduction} - (${dependentDeduction} * ${dependents})`, `= ${amount}`);

    return amount;
  }
  return null;
}