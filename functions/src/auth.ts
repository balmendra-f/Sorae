import {HttpsError} from "firebase-functions/v2/https";

export const getAuthenticatedUid = (request: {auth?: {uid?: string}}) => {
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError(
      "unauthenticated",
      "You must sign in to use Sorae.",
    );
  }

  return uid;
};
