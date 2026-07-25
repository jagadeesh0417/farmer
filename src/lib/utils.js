export function generateOrderNumber() {
  const prefix = "ARHUU";
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}${random}`;
}

export function formatPrice(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function parseJsonField(value, fallback = []) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}
