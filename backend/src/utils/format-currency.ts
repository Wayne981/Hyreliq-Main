// Convert rupees to paisa when saving (1 rupee = 100 paisa)
export function convertToPaisa(amount: number) {
  return Math.round(amount * 100);
}

// Convert paisa to rupees when retrieving
//convertFromPaisa
export function convertToRupeeUnit(amount: number) {
  return amount / 100;
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}
