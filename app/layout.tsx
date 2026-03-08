export default function RootLayout({ children }: { children: React.ReactNode }) {
  // html/body are rendered in app/[locale]/layout.tsx with dynamic lang attribute
  return <>{children}</>
}
