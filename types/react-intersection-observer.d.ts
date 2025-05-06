declare module 'react-intersection-observer' {
  export interface InViewHookResponse {
    ref: (node?: Element | null) => void;
    inView: boolean;
    entry?: IntersectionObserverEntry;
  }

  export interface InViewProps {
    onChange?: (inView: boolean, entry: IntersectionObserverEntry) => void;
    children?: React.ReactNode;
    as?: React.ElementType;
    rootMargin?: string;
    root?: Element | null;
    threshold?: number | number[];
    triggerOnce?: boolean;
    skip?: boolean;
    initialInView?: boolean;
    delay?: number;
    trackVisibility?: boolean;
    fallbackInView?: boolean;
  }

  export function useInView(options?: Omit<InViewProps, 'children' | 'as'>): InViewHookResponse;
  export default function InView(props: InViewProps): JSX.Element;
} 