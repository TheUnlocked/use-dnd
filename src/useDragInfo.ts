import { useMemo } from 'react';
import { useDraggingData } from './DragDropProvider.js';
import type { Arrayify, CollectDragStatus, ItemContent } from './types.js';

export interface UseDragInfoResult<ItemTypes extends readonly string[], Collected> {
    collected: Collected;
    types: ItemTypes;
    itemType: string;
    item: ItemContent<ItemTypes[number]>;
};

export interface UseDragInfoOptions<ItemTypes extends string | readonly string[], Collected> {
    type: ItemTypes;
    collect?: Collected | ((info: CollectDragStatus<Arrayify<ItemTypes>>) => Collected);
};

export default function useDragInfo<ItemTypes extends string | readonly string[], Collected>({
    type,
    collect,
}: UseDragInfoOptions<ItemTypes, Collected>): UseDragInfoResult<Arrayify<ItemTypes>, Collected> {
    const [itemType, item, dragEvent] = useDraggingData();

    const types = useMemo<Arrayify<ItemTypes>>(() => typeof type === 'string' ? [type] : type as any, [type]);

    const dragStatus = useMemo(() => types.includes(itemType!) ? {
        event: dragEvent,
        itemType,
        item,
    } as CollectDragStatus<Arrayify<ItemTypes>> : {}, [types, itemType, item, dragEvent]);

    const collected = useMemo(() => collect instanceof Function ? collect(dragStatus) : collect, [collect, dragStatus])!;

    return { collected, types, itemType: itemType as any, item: item as any };
}