import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useRef, useState } from 'react';

const DraggingContext = createContext<readonly [string | undefined, unknown | undefined, DragEvent | undefined]>([undefined, undefined, undefined]);
const SetDraggingContext = createContext<(args?: [type: string, item: unknown]) => void>(() => {});

const NO_DRAG_DATA = [,,,] as const;

/** @internal */
export const useDraggingData = () => useContext(DraggingContext);
export const useSetDraggingItem = () => useContext(SetDraggingContext);

export function DragDropProvider(props: PropsWithChildren<{}>) {
    const [currentItem, setCurrentItem] = useState<[string, unknown]>();
    const [dragEvent, setDragEvent] = useState<DragEvent>();
    
    const isLocalItemPresentRef = useRef(false);

    useEffect(() => {
        isLocalItemPresentRef.current = Boolean(currentItem);
    }, [currentItem]);

    useEffect(() => {
        function setEvent(e: DragEvent) {
            setDragEvent(e);
            if (!isLocalItemPresentRef.current && e.dataTransfer?.types[0]) {
                setCurrentItem([e.dataTransfer.types[0], undefined]);
            }
        }
        function clearEvent(e: DragEvent) {
            if (e.relatedTarget === null) {
                setDragEvent(undefined);
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
    return <SetDraggingContext.Provider value={setCurrentItem}>
        <DraggingContext.Provider value={useMemo(() => dragEvent ? [...currentItem ?? [,,], dragEvent] : NO_DRAG_DATA, [currentItem, dragEvent])} {...props} />
    </SetDraggingContext.Provider>;
}
