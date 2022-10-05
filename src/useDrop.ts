import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Arrayify, DragStatus, ItemContent, RefConnector } from './types.js';
import useDragInfo, { UseDragInfoOptions } from './useDragInfo.js';

type Deserializer<ItemTypes extends readonly string[]> = <ItemType extends ItemTypes[number]>(type: ItemType, data: string) => ItemContent<ItemType>;

export type UseDropResult<Collected> = [
    collectedData: Collected,
    dropTargetRef: RefConnector,
];

export interface UseDropOptions<ItemTypes extends string | readonly string[], Collected, AcceptForeign extends boolean> extends UseDragInfoOptions<ItemTypes, Collected, AcceptForeign> {
    drop?(info: DragStatus<Arrayify<ItemTypes>, false>): void;
    hover?(info: DragStatus<Arrayify<ItemTypes>, AcceptForeign>): void;
    deserialize?: Deserializer<Arrayify<ItemTypes>>;
};

export function useDrop<ItemTypes extends string | readonly string[], Collected, AcceptForeign extends boolean>(options: UseDropOptions<ItemTypes, Collected, AcceptForeign>): UseDropResult<Collected>;
export function useDrop<ItemTypes extends string | readonly string[], Collected, AcceptForeign extends boolean>(options: () => UseDropOptions<ItemTypes, Collected, AcceptForeign>, deps: unknown[]): UseDropResult<Collected>;
export function useDrop<ItemTypes extends string | readonly string[], Collected, AcceptForeign extends boolean>(
    _options: UseDropOptions<ItemTypes, Collected, AcceptForeign> | (() => UseDropOptions<ItemTypes, Collected, AcceptForeign>),
    deps?: unknown[]
): UseDropResult<Collected> {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const options = useMemo(_options instanceof Function ? _options : () => _options, deps);

    const { collected, types, itemType, item } = useDragInfo(options);

    const { deserialize, drop, hover, acceptForeign } = options;
    
    const [dropTarget, setDropTarget] = useState<HTMLElement | null>();

    const handleDragHandleRefChange: RefConnector = useCallback(elt => {
        setDropTarget(elt);
        return elt;
    }, []);

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
                    const itemType = e.dataTransfer?.types.find(x => types.includes(x));
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
    }, [types, item, itemType, deserializer, dropTarget, drop]);

    useEffect(() => {
        if (dropTarget) {
            function handler(e: DragEvent) {
                if (acceptForeign || item) {
                    hover?.({
                        event: e,
                        item,
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
