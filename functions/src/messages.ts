import {Timestamp, type QueryDocumentSnapshot} from "firebase-admin/firestore";
import {messagesRef} from "./firestore";
import {readString, toIsoDate} from "./text";
import type {ChatMessage, ChatRole} from "./types";

const serializeMessage = (
  snapshot: QueryDocumentSnapshot,
): ChatMessage => {
  const data = snapshot.data();
  const role = data.role === "user" ? "user" : "assistant";
  const text = readString(data.text);

  return {
    id: snapshot.id,
    role,
    text,
    createdAt: toIsoDate(data.createdAt),
  };
};

export const getRecentMessages = async (uid: string, limit: number) => {
  const snapshot = await messagesRef(uid)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map(serializeMessage).reverse();
};

export const saveMessage = async (
  uid: string,
  role: ChatRole,
  text: string,
): Promise<ChatMessage> => {
  const now = Timestamp.now();
  const ref = messagesRef(uid).doc();

  await ref.set({
    role,
    text,
    createdAt: now,
  });

  return {
    id: ref.id,
    role,
    text,
    createdAt: now.toDate().toISOString(),
  };
};
