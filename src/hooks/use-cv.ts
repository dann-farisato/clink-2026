"use client";

import { useState, useEffect, useCallback } from "react";
import {
  doc,
  collection,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./use-auth";
import type { CV, CVSections } from "@/types/cv";

const DEFAULT_SECTIONS: CVSections = {
  summary: { content: "", aiGenerated: false },
  experience: [],
  education: [],
  skills: [],
  custom: [],
};

const DEFAULT_SETTINGS = {
  theme: "modern",
  font: "inter",
  colorAccent: "#2563eb",
};

export function useCVList() {
  const { user } = useAuth();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function fetchCVs() {
      const q = query(
        collection(db, `users/${user!.uid}/cvs`),
        orderBy("updatedAt", "desc")
      );
      const snapshot = await getDocs(q);
      if (cancelled) return;
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as CV[];
      setCvs(data);
      setLoading(false);
    }

    fetchCVs();
    return () => { cancelled = true; };
  }, [user]);

  const createCV = useCallback(
    async (title: string) => {
      if (!user) throw new Error("Not authenticated");
      const ref = doc(collection(db, `users/${user.uid}/cvs`));
      const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
      const cv = {
        title,
        slug: `${slug}-${ref.id.slice(0, 6)}`,
        templateId: "modern",
        status: "draft" as const,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        sections: DEFAULT_SECTIONS,
        settings: DEFAULT_SETTINGS,
      };
      await setDoc(ref, cv);
      return ref.id;
    },
    [user]
  );

  const deleteCV = useCallback(
    async (cvId: string) => {
      if (!user) throw new Error("Not authenticated");
      await deleteDoc(doc(db, `users/${user.uid}/cvs/${cvId}`));
      setCvs((prev) => prev.filter((cv) => cv.id !== cvId));
    },
    [user]
  );

  return { cvs, loading, createCV, deleteCV };
}

export function useCV(cvId: string) {
  const { user } = useAuth();
  const [cv, setCV] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !cvId) return;

    async function fetchCV() {
      const ref = doc(db, `users/${user!.uid}/cvs/${cvId}`);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        setCV({ id: snapshot.id, ...snapshot.data() } as CV);
      }
      setLoading(false);
    }

    fetchCV();
  }, [user, cvId]);

  const updateCV = useCallback(
    async (updates: Partial<CV>) => {
      if (!user || !cvId) return;
      const ref = doc(db, `users/${user.uid}/cvs/${cvId}`);
      await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
      setCV((prev) => (prev ? { ...prev, ...updates } : null));
    },
    [user, cvId]
  );

  return { cv, loading, updateCV };
}
