export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html><body style={{fontFamily:'Arial', margin:20, background:'#f5f7fa'}}>{children}</body></html>;
}
