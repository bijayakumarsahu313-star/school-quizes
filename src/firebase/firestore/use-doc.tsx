'use client';

import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';

import { useFirestore } from '@/firebase';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

const useDoc = <T,>(path: string | null, id: string | null) => {
  const db = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We can't fetch a document if we don't have the path or id.
    // In this case, we are in a loading state.
    if (!db || !path || !id) {
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
    }, async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: docRef.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setData(null);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [db, path, id]);

  return { data, loading };
};

export { useDoc };
