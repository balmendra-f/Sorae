import {logger} from "firebase-functions";
import {HttpsError} from "firebase-functions/v2/https";
import {generateSoraeResponse} from "./ai";
import {ensureUserMemory, readMemory, updateMemory} from "./memory";
import {getRecentMessages, saveMessage} from "./messages";
import {createStateResponse} from "./stateResponse";
import {buildPersonalTimeline} from "./timeline";
import type {AiResponse, SoraeLocale} from "./types";

export const handleReflectionText = async (
  uid: string,
  userText: string,
  locale: SoraeLocale,
) => {
  await ensureUserMemory(uid);
  const previousMemory = await readMemory(uid);

  await saveMessage(uid, "user", userText);

  const recentMessages = await getRecentMessages(uid, 18);
  let aiResponse: AiResponse;

  try {
    aiResponse = await generateSoraeResponse(
      previousMemory,
      recentMessages,
      userText,
      locale,
    );
  } catch (error) {
    logger.error("Sorae could not generate a reflection response.", {
      uid,
      locale,
      error,
    });
    throw new HttpsError(
      "unavailable",
      "Sorae could not generate a response right now.",
    );
  }

  const assistantMessage = await saveMessage(
    uid,
    "assistant",
    aiResponse.reply,
  );
  const memory = await updateMemory(
    uid,
    userText,
    aiResponse.reply,
    previousMemory,
    aiResponse.memory,
  );
  const messages = await getRecentMessages(uid, 24);
  const timelineItems = await buildPersonalTimeline(uid);

  return createStateResponse(messages, memory, assistantMessage, timelineItems);
};
