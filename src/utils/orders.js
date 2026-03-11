// src/utils/orders.js
import {
  collection, addDoc, doc, updateDoc, getDoc,
  serverTimestamp, arrayUnion,
} from "firebase/firestore";
import { db } from "../firebase";

// ── Status flow ─────────────────────────────────────────────────
// pending_quote → quoted → agreed → advance_paid → in_progress
// → draft_uploaded → under_review → correction_sent
// → corrected → approved → final_paid → complete
// ────────────────────────────────────────────────────────────────

export const STATUS_LABELS = {
  pending_quote:    "Pending Quote",
  quoted:           "Quote Sent",
  agreed:           "Price Agreed",
  advance_paid:     "Advance Paid",
  in_progress:      "In Progress",
  draft_uploaded:   "Draft Ready",
  under_review:     "Under Review",
  correction_sent:  "Corrections Sent",
  corrected:        "Corrections Applied",
  approved:         "Client Approved",
  final_paid:       "Final Paid",
  complete:         "Complete ✓",
};

export const STATUS_BADGE = {
  pending_quote:  "badge-pending",
  quoted:         "badge-pending",
  agreed:         "badge-active",
  advance_paid:   "badge-paid",
  in_progress:    "badge-active",
  draft_uploaded: "badge-review",
  under_review:   "badge-review",
  correction_sent:"badge-review",
  corrected:      "badge-review",
  approved:       "badge-active",
  final_paid:     "badge-paid",
  complete:       "badge-complete",
};

/** Create a new order from a topic or custom request */
export async function createOrder({ clientId, clientEmail, clientName, topic, details, deadline, isCustom, existingTopicId }) {
  const ref = await addDoc(collection(db, "orders"), {
    clientId, clientEmail, clientName,
    topic, details, deadline,
    isCustom:        !!isCustom,
    existingTopicId: existingTopicId || null,
    status:          "pending_quote",
    quotedPrice:     null,
    advanceAmount:   null,
    finalAmount:     null,
    advancePaid:     false,
    finalPaid:       false,
    downloadUrl:     null,
    draftUrl:        null,
    correctedUrl:    null,
    messages:        [],
    corrections:     [],
    paystackRefs:    [],
    createdAt:       serverTimestamp(),
    updatedAt:       serverTimestamp(),
  });
  return ref.id;
}

/** Admin: send a quote */
export async function sendQuote(orderId, { price, deadline, note }) {
  await updateDoc(doc(db, "orders", orderId), {
    quotedPrice:   price,
    advanceAmount: Math.ceil(price * 0.5),
    finalAmount:   Math.floor(price * 0.5),
    quoteDeadline: deadline,
    quoteNote:     note,
    status:        "quoted",
    updatedAt:     serverTimestamp(),
  });
}

/** Client: accept quote */
export async function acceptQuote(orderId) {
  await updateDoc(doc(db, "orders", orderId), {
    status:    "agreed",
    updatedAt: serverTimestamp(),
  });
}

/** Record advance payment */
export async function recordAdvancePayment(orderId, ref) {
  await updateDoc(doc(db, "orders", orderId), {
    advancePaid:  true,
    status:       "advance_paid",
    paystackRefs: arrayUnion({ type: "advance", ref, paidAt: new Date().toISOString() }),
    updatedAt:    serverTimestamp(),
  });
}

/** Admin: mark in progress after advance confirmed */
export async function markInProgress(orderId) {
  await updateDoc(doc(db, "orders", orderId), {
    status:    "in_progress",
    updatedAt: serverTimestamp(),
  });
}

/** Admin: upload draft URL */
export async function uploadDraft(orderId, draftUrl) {
  await updateDoc(doc(db, "orders", orderId), {
    draftUrl,
    status:    "draft_uploaded",
    updatedAt: serverTimestamp(),
  });
}

/** Client: send supervisor corrections */
export async function sendCorrections(orderId, correctionNote, fileUrl) {
  await updateDoc(doc(db, "orders", orderId), {
    corrections: arrayUnion({
      note: correctionNote,
      fileUrl: fileUrl || null,
      sentAt: new Date().toISOString(),
      round: Date.now(),
    }),
    status:    "correction_sent",
    updatedAt: serverTimestamp(),
  });
}

/** Admin: upload corrected version */
export async function uploadCorrected(orderId, correctedUrl) {
  await updateDoc(doc(db, "orders", orderId), {
    correctedUrl,
    status:    "corrected",
    updatedAt: serverTimestamp(),
  });
}

/** Client: approve final version */
export async function approveFinal(orderId) {
  await updateDoc(doc(db, "orders", orderId), {
    status:    "approved",
    updatedAt: serverTimestamp(),
  });
}

/** Record final payment & unlock download */
export async function recordFinalPayment(orderId, ref) {
  await updateDoc(doc(db, "orders", orderId), {
    finalPaid:    true,
    status:       "final_paid",
    paystackRefs: arrayUnion({ type: "final", ref, paidAt: new Date().toISOString() }),
    updatedAt:    serverTimestamp(),
  });
}

/** Admin: upload final document & mark complete */
export async function unlockDownload(orderId, downloadUrl) {
  await updateDoc(doc(db, "orders", orderId), {
    downloadUrl,
    status:    "complete",
    updatedAt: serverTimestamp(),
  });
}

/** Add a chat message to an order */
export async function addMessage(orderId, { senderId, senderName, text, isAdmin }) {
  await updateDoc(doc(db, "orders", orderId), {
    messages: arrayUnion({
      senderId, senderName, text, isAdmin,
      sentAt: new Date().toISOString(),
    }),
    updatedAt: serverTimestamp(),
  });
}

export async function getOrder(orderId) {
  const snap = await getDoc(doc(db, "orders", orderId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
