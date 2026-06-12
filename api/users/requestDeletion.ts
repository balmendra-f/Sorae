import {
  getFirestore,
  doc,
  serverTimestamp,
  collection,
  writeBatch,
} from "firebase/firestore";

const requestDeletion = async (
  userId: string,
  reasonId: number,
  comment: string
) => {
  const db = getFirestore();
  const userRef = doc(db, "users", userId);
  const deletionRequestRef = doc(collection(db, "deletionRequests"));
  const deletionRequestId = deletionRequestRef.id;

  try {
    const batch = writeBatch(db);

    batch.set(deletionRequestRef, {
      userId,
      reasonId,
      comment,
      createdAt: serverTimestamp(),
    });
    batch.update(userRef, {
      deletionRequestId,
    });

    await batch.commit();
  } catch {
    throw new Error("Failed to request account deletion.");
  }
};

export default requestDeletion;
