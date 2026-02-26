export default async function RootLayout({ children }) {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-white to-gray-300 dark:from-gray-900 dark:to-black">
      {children}
    </section>
  );
}
