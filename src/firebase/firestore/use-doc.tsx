'use client';

import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useFirestore } from '@/firebase/firestore/provider';

const useDoc = <T,>(path: string | null, id: string | null) => {
  const db = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !path || !id) {
        setLoading(false);
        setData(null);
        return;
    }
    const docRef = doc(db, path, id);
    const unsubscribe = onSnapshot(docRef, (doc) => {
      if (doc.exists()) {
        setData({ id: doc.id, ...doc.data() } as T);
      } else {
        setData(null);
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching document: ", error);
        setData(null);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [db, path, id]);

  return { data, loading };
};

export { useDoc };
