"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToPaisa = convertToPaisa;
exports.convertToRupeeUnit = convertToRupeeUnit;
exports.formatCurrency = formatCurrency;
// Convert rupees to paisa when saving (1 rupee = 100 paisa)
function convertToPaisa(amount) {
    return Math.round(amount * 100);
}
// Convert paisa to rupees when retrieving
//convertFromPaisa
function convertToRupeeUnit(amount) {
    return amount / 100;
}
function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    }).format(amount);
}
