import { useEffect, useMemo, useState } from 'react';
import { useDraggingCallbacks } from './DragDropProvider.js';
import { Arrayify, ItemContent } from './types.js';

const EMPTY = {};

export type UseDragLayerResult<Collected> = Collected;

interface PopulatedDragLayerStatus<T extends readonly string[], AcceptForeign extends boolean> {
    event: DragEvent;
    item: (AcceptForeign extends true ? undefined : never) | ItemContent<T[number]>;
    itemType: T[number];
}

type EmptyDragLayerStatus = { [Key in keyof PopulatedDragLayerStatus<[], boolean>]?: undefined };

export type DragLayerStatus<T extends readonly string[], AcceptForeign extends boolean> = EmptyDragLayerStatus | PopulatedDragLayerStatus<T, AcceptForeign>;

export function useDragLayer<ItemTypes extends string | readonly string[], Collected>(
    accept: ItemTypes | null,
    collect: (info: DragLayerStatus<Arrayify<ItemTypes>, true>) => Collected,
): UseDragLayerResult<Collected> {
    const { subscribe } = useDraggingCallbacks();
    
    const types = useMemo<Arrayify<ItemTypes> | null>(() => typeof accept === 'string' ? [accept] : accept as any, [accept]);
    
    const [dragStatus, setDragStatus] = useState<DragLayerStatus<Arrayify<ItemTypes>, false>>({});
    const collected = useMemo(() => collect?.(dragStatus), [collect, dragStatus])!;

    useEffect(() => {
        return subscribe((itemType, item, event) => {
            if (event && itemType !== undefined && (!types || types.includes(itemType!))) {
                setDragStatus({
                    itemType,
                    item: item as any,
                    event,
                });
            }
            else {
                setDragStatus(EMPTY);
            }
        });
    }, [subscribe, types]);

    return collected;
}