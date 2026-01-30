
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <main className="flex w-full flex-1 flex-col items-center justify-center px-4">
            {children}
        </main>
    </div>
  );
}
