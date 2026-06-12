import {initializeApp} from "firebase-admin/app";
import {
  getFirestore,
  type CollectionReference,
  type QueryDocumentSnapshot,
} from "firebase-admin/firestore";

initializeApp();

export const db = getFirestore();

export const messagesRef = (uid: string) =>
  db.collection("users").doc(uid).collection("soraeMessages");

export const memoryRef = (uid: string) =>
  db.collection("users").doc(uid).collection("soraeMemory").doc("state");

export const dailyRef = (uid: string, dateId: string) =>
  db.collection("users")
    .doc(uid)
    .collection("soraeDailyReflections")
    .doc(dateId);

export const dailyCollectionRef = (uid: string) =>
  db.collection("users").doc(uid).collection("soraeDailyReflections");

export const checkInsRef = (uid: string) =>
  db.collection("users").doc(uid).collection("soraeCheckIns");

export const checkInRef = (uid: string, dateId: string) =>
  checkInsRef(uid).doc(dateId);

export const preferencesRef = (uid: string) =>
  db.collection("users").doc(uid).collection("soraePreferences").doc("state");

export const weeklySummaryRef = (uid: string) =>
  db.collection("users").doc(uid).collection("soraeWeekly").doc("latest");

export const deleteCollection = async (
  collectionRef: CollectionReference,
) => {
  const limit = 200;
  let snapshot = await collectionRef.limit(limit).get();

  while (!snapshot.empty) {
    const batch = db.batch();

    snapshot.docs.forEach((doc: QueryDocumentSnapshot) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    if (snapshot.size < limit) return;

    snapshot = await collectionRef.limit(limit).get();
  }
};
