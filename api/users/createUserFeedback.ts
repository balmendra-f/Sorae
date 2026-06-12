import { auth, db } from "@/firebase";
import { collection, doc, serverTimestamp, setDoc } from "firebase/firestore";

const createUserFeedback = async (description: string) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be signed in to send feedback.");
  }

  const feedbacksCollection = collection(db, "userFeedbacks");
  const newDocRef = doc(feedbacksCollection);
  const documentId = newDocRef.id;

  await setDoc(newDocRef, {
    description,
    userId: user.uid,
    createdAt: serverTimestamp(),
  });

  return documentId;
};

export default createUserFeedback;
