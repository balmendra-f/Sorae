import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export const updateUser = async (
  uid: string,
  data: Partial<{
    name: string;
    email: string;
    language: string;
  }>
) => {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      ...data,
      updatedAt: new Date().toISOString(),
    });
  } catch {
    throw new Error("Failed to update user.");
  }
};
