import { useMemo } from 'react';
import useDragInfo, { UseDragInfoOptions } from './useDragInfo.js';

export type UseDragLayerResult<Collected> = Collected;

export interface UseDragLayerOptions<ItemTypes extends string | readonly string[], Collected> extends UseDragInfoOptions<ItemTypes, Collected> {

};

export function useDragLayer<ItemTypes extends string | readonly string[], Collected>(options: UseDragLayerOptions<ItemTypes, Collected>): UseDragLayerResult<Collected>;
export function useDragLayer<ItemTypes extends string | readonly string[], Collected>(options: () => UseDragLayerOptions<ItemTypes, Collected>, deps: unknown[]): UseDragLayerResult<Collected>;
export function useDragLayer<ItemTypes extends string | readonly string[], Collected>(
    options: UseDragLayerOptions<ItemTypes, Collected> | (() => UseDragLayerOptions<ItemTypes, Collected>),
    deps?: unknown[]
): UseDragLayerResult<Collected> {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useDragInfo(useMemo(options instanceof Function ? options : () => options, deps)).collected;
}