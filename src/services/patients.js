import {
  collection, getDocs, getDoc, updateDoc,
  doc, query, where, orderBy, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Get all patients (admin) ──
export async function getAllPatients() {
  const q = query(
    collection(db, "users"),
    where("role", "==", "patient"),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ── Get single patient ──
export async function getPatient(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── Update patient profile ──
export async function updatePatient(uid, data) {
  await updateDoc(doc(db, "users", uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}