import { useMemo } from 'react';
import { useDraggingData } from './DragDropProvider.js';
import type { Arrayify, CollectDragStatus, ItemContent } from './types.js';

export interface UseDragInfoResult<ItemTypes extends readonly string[], Collected, AcceptForeign extends boolean> {
    collected: Collected;
    types: ItemTypes;
    itemType: string;
    item: (AcceptForeign extends true ? undefined : never) | ItemContent<ItemTypes[number]>;
};

export interface UseDragInfoOptions<ItemTypes extends string | readonly string[], Collected, AcceptForeign extends boolean> {
    accept: ItemTypes | null;
    collect?: (info: CollectDragStatus<Arrayify<ItemTypes>, AcceptForeign>) => Collected;
    acceptForeign?: AcceptForeign;
};

export default function useDragInfo<ItemTypes extends string | readonly string[], Collected, AcceptForeign extends boolean>({
    accept,
    collect,
    acceptForeign,
}: UseDragInfoOptions<ItemTypes, Collected, AcceptForeign>): UseDragInfoResult<Arrayify<ItemTypes>, Collected, AcceptForeign> {
    const [itemType, item, dragEvent] = useDraggingData();

    const types = useMemo<Arrayify<ItemTypes> | null>(() => typeof accept === 'string' ? [accept] : accept as any, [accept]);

    const dragStatus = useMemo(() => itemType !== undefined && (!types || types.includes(itemType!)) && (acceptForeign || item) ? {
        event: dragEvent,
        itemType,
        item,
    } as CollectDragStatus<Arrayify<ItemTypes>, AcceptForeign> : {}, [types, itemType, item, dragEvent, acceptForeign]);

    const collected = useMemo(() => collect?.(dragStatus), [collect, dragStatus])!;

    return { collected, types: types ?? dragEvent?.dataTransfer?.types ?? [] as any, itemType: itemType as any, item: item as any };
}