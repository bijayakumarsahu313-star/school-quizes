'use client';

import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useFirestore } from '@/firebase';

const useDoc = <T,>(path: string | null, id: string | null) => {
  const db = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We can't fetch a document if we don't have the path or id.
    // In this case, we are in a loading state.
    if (!path || !id) {
        setLoading(true);
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
