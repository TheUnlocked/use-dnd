import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef } from 'react';

type SubscriptionCallback = (itemType?: string, item?: unknown, event?: DragEvent) => void;

/** @internal */
export interface DraggingContextProps {
    subscribe(callback: SubscriptionCallback): () => void;
    beginDrag(...args: [itemType: string, item: unknown] | []): void;
}

const DraggingContext = createContext<DraggingContextProps>({
    subscribe() { throw new Error('Cannot use `use-drag` hooks outside of a `DragDropProvider`'); },
    beginDrag() { throw new Error('Cannot use `use-drag` hooks outside of a `DragDropProvider`'); },
});

/** @internal */
export const useDraggingCallbacks = () => useContext(DraggingContext);

export function DragDropProvider(props: PropsWithChildren<{}>) {
    const draggingLocal = useRef(false);
    const currentItem = useRef<[string, unknown]>();
    const susbcriptions = useRef(new Set<SubscriptionCallback>());

    useEffect(() => {
        function setEvent(e: DragEvent) {
            if (!draggingLocal.current && e.dataTransfer?.types[0]) {
                currentItem.current = [e.dataTransfer.types[0], undefined];
            }
            susbcriptions.current.forEach(callback => callback(...currentItem.current ?? [,,] as [string | undefined, unknown], e));
        }
        function clearEvent(e: DragEvent) {
            if (e.relatedTarget === null) {
                susbcriptions.current.forEach(callback => callback(undefined, undefined, e));
            }
        }

        document.addEventListener('drop', clearEvent);
        document.addEventListener('dragover', setEvent);
        document.addEventListener('dragleave', clearEvent);
        return () => {
            document.removeEventListener('drop', clearEvent);
            document.removeEventListener('dragover', setEvent);
            document.removeEventListener('dragleave', clearEvent);
        };
    }, []);
    return <DraggingContext.Provider {...props} value={useMemo(() => ({
        subscribe(callback) {
            if (susbcriptions.current.has(callback)) {
                throw new Error('Cannot subscribe with the same callback multiple times');
            }
            susbcriptions.current.add(callback);
            return () => susbcriptions.current.delete(callback);
        },
        beginDrag(...args: [itemType: string, item: unknown] | []) {
            if (args.length === 0) {
                currentItem.current = undefined;
                draggingLocal.current = false;
            }
            else {
                currentItem.current = args;
                draggingLocal.current = true;
            }
            susbcriptions.current.forEach(callback => callback(...args as [itemType?: string, item?: unknown]));
        },
    }), [])} />;
}
