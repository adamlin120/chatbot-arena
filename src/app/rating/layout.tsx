export default function RatingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <main className="hidden-scrollbar">{children}</main>;
}
