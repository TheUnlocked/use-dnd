import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDraggingCallbacks } from './DragDropProvider.js';
import type { ItemContent, RefConnector } from './types.js';

const identity = <T>(x: T): T => x;

export type UseDragResult<Collected> = [
    collectedData: Collected,
    dragHandleRef: RefConnector,
    dragPreviewRef: RefConnector,
];

export interface UseDragOptions<ItemType extends string, Collected> {
    type: ItemType;
    item: ItemContent<ItemType>;
    serialize?(item: ItemContent<ItemType>): string;
    startDragging?(event: DragEvent): void;
    finishDragging?(event: DragEvent): void;
    collect?: (event?: DragEvent) => Collected;
};

export function useDrag<Collected>(options: UseDragOptions<string, Collected>): UseDragResult<Collected>;
export function useDrag<Collected>(options: () => UseDragOptions<string, Collected>, deps: unknown[]): UseDragResult<Collected>;
export function useDrag<Collected>(options: UseDragOptions<string, Collected> | (() => UseDragOptions<string, Collected>), deps?: unknown[]): UseDragResult<Collected> {
    const {
        type,
        item,
        serialize,
        collect,
        finishDragging,
        startDragging
    // eslint-disable-next-line react-hooks/exhaustive-deps
    } = useMemo(options instanceof Function ? options : () => options, deps);

    const [dragEvent, setDragEvent] = useState<DragEvent>();
    
    const collectedData = useMemo(() => collect ? collect(dragEvent) : undefined, [collect, dragEvent])!;
    
    const serializer = useMemo(() => {
        if (serialize) {
            return serialize;
        }
        if (type.startsWith('text/')) {
            return identity;
        }
        return JSON.stringify;
    }, [serialize, type]);

    const [dragHandle, setDragHandle] = useState<HTMLElement | null>();
    const dragPreviewRef = useRef<HTMLElement | null>();

    const handleDragHandleRefChange: RefConnector = useCallback(elt => {
        setDragHandle(elt);
        return elt;
    }, []);

    const handleDragPreviewRefChange: RefConnector = useCallback(elt => {
        dragPreviewRef.current = elt;
        return elt;
    }, []);

    useEffect(() => {
        if (dragHandle) {
            function handler(e: DragEvent) {
                setDragEvent(e);
            }
            
            dragHandle.draggable = true;
            dragHandle.addEventListener('drag', handler);
            return () => {
                dragHandle.draggable = false;
                dragHandle.removeEventListener('drag', handler);
            };
        }
        else {
            setDragEvent(undefined);
        }
    }, [dragHandle]);

    const { setDrag } = useDraggingCallbacks();

    useEffect(() => {
        if (dragHandle) {
            function handler(e: DragEvent) {
                if (!e.dataTransfer) {
                    // drag must've gotten cancelled before we got this event
                    return;
                }
                if (dragPreviewRef.current) {
                    e.dataTransfer.setDragImage(dragPreviewRef.current, e.offsetX, e.offsetY);
                }
                e.dataTransfer.setData(type, serializer(item));
                setDrag(type, item);
                startDragging?.(e);
            }

            dragHandle.addEventListener('dragstart', handler);
            
            return () => dragHandle.removeEventListener('dragstart', handler);
        }
    }, [type, item, dragHandle, serializer, startDragging, setDrag]);

    useEffect(() => {
        if (dragHandle) {
            function handler(e: DragEvent) {
                finishDragging?.(e);
                setDragEvent(undefined);
                setDrag();
            }
            dragHandle.addEventListener('dragend', handler);
            
            return () => dragHandle.removeEventListener('dragend', handler);
        }
    }, [dragHandle, finishDragging, setDrag]);

    return [
        collectedData,
        handleDragHandleRefChange,
        handleDragPreviewRefChange,
    ];
}
