"use client";

import { useState, useEffect } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const googleProvider = new GoogleAuthProvider();

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
  const signInWithEmail = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);
  const signUpWithEmail = (email: string, password: string) =>
    createUserWithEmailAndPassword(auth, email, password);
  const signOut = () => firebaseSignOut(auth);

  return { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut };
}
