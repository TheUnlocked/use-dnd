export type RefConnector = <T extends HTMLElement | null | undefined>(elt: T) => T;

export type ItemContent<T extends string> =
    T extends keyof DragTypeItemContentMap
        ? DragTypeItemContentMap[T]
        : T extends `text/${string}`
            ? string
            : unknown;

export interface DragTypeItemContentMap {
    
}

export interface EventStatus<T extends readonly string[], AcceptForeign extends boolean> {
    event: DragEvent;
    item: (AcceptForeign extends true ? undefined : never) | ItemContent<T[number]>;
    itemType: T[number];
}

export type Arrayify<T extends string | readonly string[]> = T extends string ? readonly [T] : T;
