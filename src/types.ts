export type RefConnector = <T extends HTMLElement | null | undefined>(elt: T) => T;

export type ItemContent<T extends string> =
    T extends keyof DragTypeItemContentMap
        ? DragTypeItemContentMap[T]
        : T extends `text/${string}`
            ? string
            : unknown;

export interface DragTypeItemContentMap {
    
}

interface EmptyDragStatus {
    event?: undefined;
    item?: undefined;
    itemType?: undefined;
    items?: undefined;
}

export interface DragStatus<T extends readonly string[]> {
    event: DragEvent;
    item: ItemContent<T[number]>;
    itemType: T[number];
    // items: { [ItemType in T[number]]: ItemContent<ItemType> };
}

export type CollectDragStatus<T extends readonly string[]> = EmptyDragStatus | DragStatus<T>;

export type Arrayify<T extends string | readonly string[]> = T extends string ? readonly [T] : T;
