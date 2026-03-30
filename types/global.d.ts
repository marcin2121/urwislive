import 'react';

declare global {
  interface Window {
    gtag?: (command: string, ...args: any[]) => void;
  }
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & {
        src?: string;
        ar?: boolean;
        'ar-modes'?: string;
        'camera-controls'?: boolean;
        alt?: string;
        id?: string;
      }, HTMLElement>;
    }
  }
}
