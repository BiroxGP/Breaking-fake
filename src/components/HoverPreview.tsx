import { createContext, useContext, useState, type ReactNode } from 'react';

const HoverPreviewCtx = createContext<(content: ReactNode | null) => void>(() => {});

export function HoverPreviewProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<ReactNode | null>(null);

  return (
    <HoverPreviewCtx.Provider value={setPreview}>
      {children}
      {preview && (
        <div className="hidden sm:block fixed z-[300] pointer-events-none top-1/2 right-3 -translate-y-1/2 drop-shadow-2xl">
          {preview}
        </div>
      )}
    </HoverPreviewCtx.Provider>
  );
}

export function useHoverPreview() {
  return useContext(HoverPreviewCtx);
}

/** Wraps a small card so hovering it shows `preview` (a bigger, non-interactive rendition)
 * fixed on-screen, where the text is actually readable. */
export function Magnify({
  preview,
  children,
  className,
}: {
  preview: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const setPreview = useHoverPreview();
  return (
    <div
      className={className}
      onMouseEnter={() => setPreview(<div className="scale-[1.8] origin-center">{preview}</div>)}
      onMouseLeave={() => setPreview(null)}
    >
      {children}
    </div>
  );
}
