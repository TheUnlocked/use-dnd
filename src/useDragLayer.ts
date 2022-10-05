import { Arrayify, CollectDragStatus } from './types.js';
import useDragInfo from './useDragInfo.js';

export type UseDragLayerResult<Collected> = Collected;

export function useDragLayer<ItemTypes extends string | readonly string[], Collected>(
    accept: ItemTypes | null,
    collect: (info: CollectDragStatus<Arrayify<ItemTypes>, true>) => Collected,
): UseDragLayerResult<Collected> {
    return useDragInfo({ accept, collect, acceptForeign: true }).collected;
}