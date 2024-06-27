export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="hidden-scrollbar">{children}</main>;
}
