import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
} from "react-router-dom";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import Home from "./page/home";
import ProductDetail from "./page/productDetail";
import AdminDashboard from "./page/AdminDashboard";

const ADMIN_EMAILS = ["jarodvines18@gmail.com"];

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const syncUserProfile = async (firebaseUser) => {
    if (!firebaseUser) {
      setUserProfile(null);
      return null;
    }

    const userRef = doc(db, "users", firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      const profile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "Usuario",
        email: firebaseUser.email || "",
        photo: firebaseUser.photoURL || "",
        role: ADMIN_EMAILS.includes((firebaseUser.email || "").toLowerCase())
          ? "admin"
          : "customer",
        createdAt: new Date().toISOString(),
      };

      await setDoc(userRef, profile);
      setUserProfile(profile);
      return profile;
    }

    const profile = userSnap.data();
    setUserProfile(profile);
    return profile;
  };

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!mounted) return;

      try {
        setUser(firebaseUser);

        if (!firebaseUser) {
          setUserProfile(null);
          return;
        }

        await syncUserProfile(firebaseUser);
      } catch (error) {
        console.error("Error al sincronizar perfil del usuario:", error);
        setUserProfile(null);
      } finally {
        if (mounted) {
          setAuthReady(true);
        }
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      const profile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || "Usuario",
        email: firebaseUser.email || "",
        photo: firebaseUser.photoURL || "",
        role: ADMIN_EMAILS.includes((firebaseUser.email || "").toLowerCase())
          ? "admin"
          : "customer",
        createdAt:
          userSnap.exists() && userSnap.data().createdAt
            ? userSnap.data().createdAt
            : new Date().toISOString(),
      };

      await setDoc(userRef, profile, { merge: true });
      setUser(firebaseUser);
      setUserProfile(profile);
      setAuthReady(true);
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      setAuthReady(true);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const isAdmin = Boolean(
    userProfile &&
      (userProfile.role === "admin" ||
        ADMIN_EMAILS.includes((userProfile.email || "").toLowerCase()))
  );

  const getInitials = (name = "") => {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  };

  const getAvatarClassName = () => {
    if (isAdmin) return "user-avatar user-avatar--admin";
    if ((userProfile?.gender || "male").toLowerCase() === "female") {
      return "user-avatar user-avatar--female";
    }
    return "user-avatar user-avatar--male";
  };

  if (!authReady) {
    return <div className="auth-loading">Cargando aplicación...</div>;
  }

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="global-auth-bar">
          <div className="global-auth-bar__inner">
            {user ? (
              <>
                <div className="user-chip">
                  {isAdmin ? (
                    <div className={getAvatarClassName()} aria-label="Avatar de administrador">
                      {getInitials(userProfile?.name || user.displayName || user.email || "JC")}
                    </div>
                  ) : user.photoURL ? (
                    <img
                      className={getAvatarClassName()}
                      src={user.photoURL}
                      alt={user.displayName || "Usuario"}
                    />
                  ) : (
                    <div className={getAvatarClassName()} aria-label="Avatar del usuario">
                      {getInitials(userProfile?.name || user.displayName || user.email || "U")}
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <Link to="/admin" className="small-button">
                    Admin
                  </Link>
                )}
                <button
                  type="button"
                  className="small-button secondary"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="global-auth-bar__placeholder" aria-hidden="true" />
            )}
          </div>
        </header>

        <Routes>
          <Route
            path="/"
            element={
              <Home
                user={userProfile}
                onLogin={handleLogin}
                onLogout={handleLogout}
                isAdmin={isAdmin}
              />
            }
          />
          <Route path="/producto/:productId" element={<ProductDetail />} />
          <Route
            path="/mi-cuenta"
            element={
              userProfile ? (
                <AdminDashboard user={userProfile} isAdmin={false} currentUserId={user?.uid} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/admin"
            element={
              isAdmin ? (
                <AdminDashboard user={userProfile} isAdmin={true} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;