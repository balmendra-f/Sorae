import * as AppleAuthentication from "expo-apple-authentication";
import {
  OAuthProvider,
  getAdditionalUserInfo,
  getAuth,
  signInWithCredential,
} from "firebase/auth";
import createUser from "./createUser";

const isAppleCancellation = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "ERR_REQUEST_CANCELED";

const signInWithApple = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });
    const identityToken = credential.identityToken;

    if (!identityToken) {
      throw new Error("Apple sign-in did not return an identity token.");
    }

    const provider = new OAuthProvider("apple.com");
    const firebaseCredential = provider.credential({
      idToken: identityToken,
    });

    const userCredential = await signInWithCredential(
      getAuth(),
      firebaseCredential,
    );
    const { displayName, email: userEmail, uid } = userCredential.user;
    const additionalUserInfo = getAdditionalUserInfo(userCredential);
    const isNewUser = additionalUserInfo?.isNewUser;

    if (isNewUser) {
      await createUser({
        uid: uid,
        name: displayName || "",
        email: userEmail || "",
      });
    }
  } catch (error: unknown) {
    if (isAppleCancellation(error)) return;

    throw new Error("Apple sign-in failed.");
  }
};

export default signInWithApple;
