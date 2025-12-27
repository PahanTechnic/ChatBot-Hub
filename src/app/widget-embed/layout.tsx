export default function WidgetEmbedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <style>{`
        body {
          margin: 0;
          padding: 0;
          background: transparent !important;
          overflow: hidden;
        }
      `}</style>

      {children}
    </div>
  )
}
