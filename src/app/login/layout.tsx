export default function LoginLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <main className="overflow-y-scroll">
        <div>
          {children}
        </div> 
      </main>
    )
  }
  