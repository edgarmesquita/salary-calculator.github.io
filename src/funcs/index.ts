
export const formatCurrency = (number: number): string => {
  return number.toLocaleString("pt-PT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  });
}