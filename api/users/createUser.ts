import { db } from "@/firebase";
import { getCalendars, getLocales } from "expo-localization";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

interface UserData {
  uid: string;
  name: string;
  email: string;
}

const createUser = async (userData: UserData) => {
  const { uid, name, email } = userData;
  const [locale] = getLocales();
  const [calendar] = getCalendars();
  const timezone = calendar?.timeZone;

  try {
    await setDoc(
      doc(db, "users", uid),
      {
        name,
        email,
        createdAt: serverTimestamp(),
        country: locale?.regionCode || null,
        timezone: timezone || null,
      },
      { merge: true },
    );
  } catch {
    throw new Error("Failed to create user.");
  }
};

export default createUser;
