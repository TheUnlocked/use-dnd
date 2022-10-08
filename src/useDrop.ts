import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDraggingCallbacks } from './DragDropProvider.js';
import type { Arrayify, EventStatus, ItemContent, RefConnector } from './types.js';

function dropStatusEql(left: DropStatus<string[], boolean>, right: DropStatus<string[], boolean>) {
    return left.item === right.item
        && left.itemType === right.itemType
        && left.isOver === right.isOver;
}

type Deserializer<ItemTypes extends readonly string[]> = <ItemType extends ItemTypes[number]>(type: ItemType, data: string) => ItemContent<ItemType>;

interface PopulatedDropStatus<T extends readonly string[], AcceptForeign extends boolean> {
    item: (AcceptForeign extends true ? undefined : never) | ItemContent<T[number]>;
    itemType: T[number];
    isOver: boolean;
}

type EmptyDropStatus = { [Key in keyof PopulatedDropStatus<[], boolean>]?: undefined };

export type DropStatus<T extends readonly string[], AcceptForeign extends boolean> = EmptyDropStatus | PopulatedDropStatus<T, AcceptForeign>;

export type UseDropResult<Collected> = [
    collectedData: Collected,
    dropTargetRef: RefConnector,
];

export interface UseDropOptions<ItemTypes extends string | readonly string[], Collected, AcceptForeign extends boolean> {
    accept: ItemTypes | null;
    collect?: (info: DropStatus<Arrayify<ItemTypes>, AcceptForeign>) => Collected;
    acceptForeign?: AcceptForeign;
    drop?(info: EventStatus<Arrayify<ItemTypes>, false>): void;
    hover?(info: EventStatus<Arrayify<ItemTypes>, AcceptForeign>): void;
    deserialize?: Deserializer<Arrayify<ItemTypes>>;
};

export function useDrop<ItemTypes extends string | readonly string[], Collected, AcceptForeign extends boolean>(options: UseDropOptions<ItemTypes, Collected, AcceptForeign>): UseDropResult<Collected>;
export function useDrop<ItemTypes extends string | readonly string[], Collected, AcceptForeign extends boolean>(options: () => UseDropOptions<ItemTypes, Collected, AcceptForeign>, deps: unknown[]): UseDropResult<Collected>;
export function useDrop<ItemTypes extends string | readonly string[], Collected, AcceptForeign extends boolean>(
    _options: UseDropOptions<ItemTypes, Collected, AcceptForeign> | (() => UseDropOptions<ItemTypes, Collected, AcceptForeign>),
    deps?: unknown[]
): UseDropResult<Collected> {
    const {
        accept,
        acceptForeign,
        collect,
        deserialize,
        drop,
        hover,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    } = useMemo(_options instanceof Function ? _options : () => _options, deps);
    
    const [dropTarget, setDropTarget] = useState<HTMLElement | null>(null);

    const handleDragHandleRefChange: RefConnector = useCallback(elt => {
        setDropTarget(elt ?? null);
        return elt;
    }, []);

    const { subscribe } = useDraggingCallbacks();
    
    const types = useMemo<Arrayify<ItemTypes> | null>(() => typeof accept === 'string' ? [accept] : accept as any, [accept]);
    
    const [dragStatus, setDragStatus] = useState<DropStatus<Arrayify<ItemTypes>, AcceptForeign>>({});
    const collected = useMemo(() => collect?.(dragStatus), [collect, dragStatus])!;

    useEffect(() => {
        return subscribe((itemType, item, event) => {
            if (itemType !== undefined && (!types || types.includes(itemType!)) && (acceptForeign || item)) {
                const newDragStatus = {
                    itemType,
                    item: item as any,
                    isOver: dropTarget && event?.target instanceof Node ? dropTarget.contains(event.target) : false,
                };
                setDragStatus(dragStatus => dropStatusEql(newDragStatus, dragStatus) ? dragStatus : newDragStatus);
            }
            else {
                setDragStatus(dragStatus => dropStatusEql({}, dragStatus) ? dragStatus : {});
            }
        });
    }, [subscribe, acceptForeign, types, dropTarget]);

    const itemType = dragStatus.itemType!;
    const item = dragStatus.item;
    const effectiveTypes = useMemo(() => types ?? (dragStatus.itemType ? [dragStatus.itemType] : []), [types, dragStatus.itemType]);

    const deserializer = useCallback((type: string, data: string) => {
        if (deserialize) {
            return deserialize(type, data);
        }
        if (type.startsWith('text/')) {
            return data;
        }
        return JSON.parse(data);
    }, [deserialize]);

    useEffect(() => {
        if (dropTarget && drop) {
            function handler(e: DragEvent) {
                if (item !== undefined) {
                    drop!({
                        event: e,
                        item,
                        itemType,
                    });
                }
                else {
                    const itemType = e.dataTransfer?.types.find(x => effectiveTypes.includes(x));
                    if (itemType) {
                        drop!({
                            event: e,
                            itemType,
                            item: deserializer(itemType, e.dataTransfer!.getData(itemType)),
                        });
                    }
                }
            }
    
            dropTarget.addEventListener('drop', handler);
            return () => dropTarget.removeEventListener('drop', handler);
        }
    }, [effectiveTypes, item, itemType, deserializer, dropTarget, drop]);

    useEffect(() => {
        if (dropTarget) {
            function handler(e: DragEvent) {
                if (acceptForeign || item) {
                    hover?.({
                        event: e,
                        // item isn't necessary non-undefined here, but due to the complexity of the types involved
                        // TypeScript isn't able to figure out that an undefined item is allowed here.
                        item: item!,
                        itemType,
                    });
                    e.preventDefault();
                }
            }
    
            dropTarget.addEventListener('dragenter', handler);
            dropTarget.addEventListener('dragover', handler);
            return () => {
                dropTarget.removeEventListener('dragenter', handler);
                dropTarget.removeEventListener('dragover', handler);
            };
        }
    }, [acceptForeign, item, itemType, dropTarget, hover]);

    return [
        collected,
        handleDragHandleRefChange,
    ];
}
