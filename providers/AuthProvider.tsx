import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { auth } from "../firebase";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface Context {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: AuthUser | null;
}

const initialContext: Context = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
};

const AuthContext = createContext<Context>(initialContext);

const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
          });
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        setIsLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ isLoading, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
};

function useAuth() {
  return useContext(AuthContext);
}

export { useAuth };
export type { AuthUser };
export default AuthProvider;
