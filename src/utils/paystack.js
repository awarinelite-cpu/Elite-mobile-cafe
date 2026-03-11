// src/utils/paystack.js
// ─────────────────────────────────────────────────────────────────
// Paystack inline payment helper.
// Docs: https://paystack.com/docs/payments/accept-payments/#popup
// ─────────────────────────────────────────────────────────────────

export function loadPaystackScript() {
  return new Promise((resolve) => {
    if (document.getElementById("paystack-script")) return resolve();
    const script = document.createElement("script");
    script.id  = "paystack-script";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = resolve;
    document.body.appendChild(script);
  });
}

/**
 * Open the Paystack payment popup.
 * @param {object} opts
 * @param {string} opts.email       - customer email
 * @param {number} opts.amountNGN   - amount in Naira (converted to kobo internally)
 * @param {string} opts.reference   - unique transaction reference
 * @param {string} opts.label       - e.g. "Advance Payment – Order #xxx"
 * @param {function} opts.onSuccess - called with { reference } on success
 * @param {function} opts.onClose   - called when popup is closed without paying
 */
export async function openPaystack({ email, amountNGN, reference, label, onSuccess, onClose }) {
  await loadPaystackScript();

  const handler = window.PaystackPop.setup({
    key:       process.env.REACT_APP_PAYSTACK_PUBLIC_KEY,
    email,
    amount:    Math.round(amountNGN * 100), // kobo
    currency:  "NGN",
    ref:       reference,
    label:     label || "ResearchHub Payment",
    metadata: { custom_fields: [{ display_name: "Platform", value: "ResearchHub" }] },
    callback(response) {
      if (onSuccess) onSuccess(response);
    },
    onClose() {
      if (onClose) onClose();
    },
  });

  handler.openIframe();
}

/** Generate a unique Paystack reference */
export function generateRef(prefix = "RH") {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}
