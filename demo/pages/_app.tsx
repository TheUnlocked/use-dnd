import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { DragDropProvider } from 'use-dnd';

function MyApp({ Component, pageProps }: AppProps) {
    return <DragDropProvider>
        <Component {...pageProps} />
    </DragDropProvider>;
}

export default MyApp;
