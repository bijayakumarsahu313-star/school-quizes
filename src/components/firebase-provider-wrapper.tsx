
'use client';
import { FirebaseErrorListener } from "@/components/FirebaseErrorListener";

export default function FirebaseProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {process.env.NODE_ENV === 'development' && <FirebaseErrorListener />}
    </>
  );
}
