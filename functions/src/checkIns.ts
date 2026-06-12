import {Timestamp} from "firebase-admin/firestore";
import {checkInRef} from "./firestore";
import {compactText, isRecord, readString} from "./text";

const dateIdForNow = () => new Date().toISOString().slice(0, 10);

export const saveCheckIn = async (
  uid: string,
  input: unknown,
) => {
  const data = isRecord(input) ? input : {};
  const mood = compactText(readString(data.mood), 32);
  const energy =
    typeof data.energy === "number" && !Number.isNaN(data.energy) ?
      Math.max(1, Math.min(5, Math.round(data.energy))) :
      undefined;
  const note = compactText(readString(data.note), 180);

  if (!mood || energy === undefined) {
    throw new Error("invalid-check-in");
  }

  const now = Timestamp.now();
  const dateId = dateIdForNow();

  await checkInRef(uid, dateId).set({
    mood,
    energy,
    note,
    createdAt: now,
    createdAtIso: now.toDate().toISOString(),
    updatedAt: now,
  }, {merge: true});

  return `Today's check-in: mood ${mood}, energy ${energy}/5` +
    (note ? `. Note: ${note}` : ".");
};
