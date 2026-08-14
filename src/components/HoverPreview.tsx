import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
  type TouchEvent as ReactTouchEvent,
} from 'react';

interface PreviewState {
  content: ReactNode;
  x: number;
  y: number;
}

const HoverPreviewCtx = createContext<(state: PreviewState | null) => void>(() => {});

const MARGIN = 12;
const CURSOR_GAP = 22;

export function HoverPreviewProvider({ children }: { children: ReactNode }) {
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({ visibility: 'hidden' });

  useLayoutEffect(() => {
    if (!preview || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const spaceRight = vw - preview.x;
    const spaceLeft = preview.x;
    let left: number;
    if (spaceRight >= rect.width + CURSOR_GAP + MARGIN || spaceRight >= spaceLeft) {
      left = preview.x + CURSOR_GAP;
      left = Math.min(left, vw - MARGIN - rect.width);
    } else {
      left = preview.x - CURSOR_GAP - rect.width;
    }
    left = Math.max(MARGIN, left);

    let top = preview.y - rect.height / 2;
    top = Math.max(MARGIN, Math.min(top, vh - rect.height - MARGIN));

    setStyle({ left, top, visibility: 'visible' });
  }, [preview]);

  return (
    <HoverPreviewCtx.Provider value={setPreview}>
      {children}
      {preview && (
        <div
          ref={ref}
          className="fixed z-[300] pointer-events-none drop-shadow-2xl scale-[2] origin-top-left"
          style={style}
        >
          {preview.content}
        </div>
      )}
    </HoverPreviewCtx.Provider>
  );
}

export function useHoverPreview() {
  return useContext(HoverPreviewCtx);
}

/** When a card is hovered right as the screen changes (a modal swaps in, the turn passes, a
 * phase transitions), React unmounts it without ever firing onMouseLeave, leaving the zoomed
 * preview stuck on screen. Render this once per "scene" so it clears whenever `sceneKey` changes. */
export function ClearOnChange({ sceneKey }: { sceneKey: string }) {
  const setPreview = useHoverPreview();
  useEffect(() => {
    setPreview(null);
  }, [sceneKey, setPreview]);
  return null;
}

const LONG_PRESS_MS = 350;

/** Wraps a small card so hovering it shows `preview` (a bigger, non-interactive rendition),
 * fixed on-screen at cursor height, flipping to whichever side has room so it's never clipped.
 *
 * On touch devices there's no "leave" gesture equivalent to a mouse moving away, so a plain tap
 * (which browsers turn into a synthetic mouseenter) would leave the zoomed preview stuck on
 * screen. Instead, touch shows the preview only while the finger is held down past
 * LONG_PRESS_MS — a quick tap still just selects the card as normal — and always hides it the
 * moment the finger lifts or moves. */
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
  const longPressTimer = useRef<number | null>(null);

  const clearLongPressTimer = () => {
    if (longPressTimer.current !== null) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const show = (e: ReactMouseEvent) => {
    setPreview({ content: preview, x: e.clientX, y: e.clientY });
  };

  const handleTouchStart = (e: ReactTouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    const x = touch.clientX;
    const y = touch.clientY;
    clearLongPressTimer();
    longPressTimer.current = window.setTimeout(() => {
      setPreview({ content: preview, x, y });
      longPressTimer.current = null;
    }, LONG_PRESS_MS);
  };

  const handleTouchEnd = () => {
    clearLongPressTimer();
    setPreview(null);
  };

  return (
    <div
      className={className}
      onMouseEnter={show}
      onMouseMove={show}
      onMouseLeave={() => setPreview(null)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchEnd}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
    >
      {children}
    </div>
  );
}
