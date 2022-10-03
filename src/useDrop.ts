import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Arrayify, DragStatus, ItemContent, RefConnector } from './types.js';
import useDragInfo, { UseDragInfoOptions } from './useDragInfo.js';

type Deserializer<ItemTypes extends readonly string[]> = <ItemType extends ItemTypes[number]>(type: ItemType, data: string) => ItemContent<ItemType>;

export type UseDropResult<Collected> = [
    collectedData: Collected,
    dropTargetRef: RefConnector,
];

export interface UseDropOptions<ItemTypes extends string | readonly string[], Collected> extends UseDragInfoOptions<ItemTypes, Collected> {
    drop?(info: DragStatus<Arrayify<ItemTypes>>): void;
    hover?(info: DragStatus<Arrayify<ItemTypes>>): void;
    deserialize?: Deserializer<Arrayify<ItemTypes>>;
    allowForeign?: boolean;
};

export function useDrop<ItemTypes extends string | readonly string[], Collected>(options: UseDropOptions<ItemTypes, Collected>): UseDropResult<Collected>;
export function useDrop<ItemTypes extends string | readonly string[], Collected>(options: () => UseDropOptions<ItemTypes, Collected>, deps: unknown[]): UseDropResult<Collected>;
export function useDrop<ItemTypes extends string | readonly string[], Collected>(
    _options: UseDropOptions<ItemTypes, Collected> | (() => UseDropOptions<ItemTypes, Collected>),
    deps?: unknown[]
): UseDropResult<Collected> {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const options = useMemo(_options instanceof Function ? _options : () => _options, deps);

    const { collected, types, itemType, item } = useDragInfo(options);

    const { deserialize, allowForeign, drop, hover } = options;
    
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
                if (item) {
                    drop!({
                        event: e,
                        item,
                        itemType,
                    });
                }
                else if (allowForeign) {
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
    }, [types, item, itemType, allowForeign, deserializer, dropTarget, drop]);

    useEffect(() => {
        if (dropTarget) {
            function handler(e: DragEvent) {
                hover?.({
                    event: e,
                    item,
                    itemType,
                });
                if (allowForeign || item) {
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
    }, [allowForeign, item, itemType, dropTarget, hover]);

    return [
        collected,
        handleDragHandleRefChange,
    ];
}
