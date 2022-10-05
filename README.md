# `use-dnd`

[![npm version](https://img.shields.io/npm/v/use-dnd)](https://www.npmjs.com/package/use-dnd)
[![monthly downloads](https://img.shields.io/npm/dm/use-dnd)](https://www.npmjs.com/package/use-dnd)
[![license](https://img.shields.io/npm/l/use-dnd)](./LICENSE)


`use-dnd` is a drag-and-drop library for React heavily based on [`react-dnd`](https://github.com/react-dnd/react-dnd/), but with an emphasis HTML5 drag-and-drop. `use-dnd` is _not_ a drop-in replacement for `react-dnd`, but it has been designed to require minimal effort to switch over.

## Features

* Feature parity with `react-dnd`'s `HTML5Backend`, including
    * `useDrag`/`useDrop` hooks
    * Custom drag handles
    * Custom drag preview
    * Drag layers with `useDragLayer`
* Support for foreign objects (e.g. dragging from one window to another)
* Direct access to DOM events
    * Allows for fine-grained control over drop effect
* Extremely light (~2kB bundled and gzipped)

## Installation

`use-dnd` is available on NPM. Install it with:
```
npm i use-dnd
```
Or the equivalent for your package manager of choice.

⚠️ `use-dnd` is ESM-only.

### Package size

The NPM bundle is much larger than the final bundled output would be with something like [webpack](https://webpack.js.org/) because it is not minified and includes the TypeScript source and source maps. While the exact bundled size may vary slightly, it should be quite small. Based on estimates from `pnpm analyze` in `./demo`, the final minified and gzipped size will probably be around 2 kB.

### Source Maps

`use-dnd` comes with the TypeScript sources and source maps for them. If you are using a bundler like webpack which performs its own transformations to the code, you may need to configure your bundler to provide you with the source maps (e.g. in webpack you would use [`source-map-loader`](https://webpack.js.org/loaders/source-map-loader/), see `./demo/next.config.js` for an example).

### ESLint

If you're using the `react-hooks/exhaustive-deps` ESLint rule (as you should be), configure it to include `useDrag` and `useDrop` in `additionalHooks`:

```json
{
    "rules": {
        "react-hooks/exhaustive-deps": [
            "warn",
            {
                "additionalHooks": "^(useDrop|useDrag)$"
            }
        ]
    }
}
```

## Why not `use-dnd`?

If you need touch support you should use [`react-dnd`](https://github.com/react-dnd/react-dnd/) instead. It may be possible to combine `use-dnd` and `react-dnd` in order to get touch support on mobile devices while keeping some of the nicer feature from `use-dnd` like foreign object support. Alternatively, you may want to use a more batteries-included drag-and-drop library like [`dnd-kit`](https://dndkit.com/).

If you need keyboard support to be included out-of-the-box, you should use a different drag-and-drop library like [`dnd-kit`](https://dndkit.com/).

Additionally, if you simply don't need the extra features that `use-dnd` provides over other libraries (such as foreign objects) and are willing to take a small size penalty for a more abstracted API, another drag-and-drop library may be a better choice.

## Issues

Feel free to file bug reports or feature requests in the GitHub issues page. For the best response when filing bug reports, please be as specific as possible and provide a [minimal reproducible example](https://en.wikipedia.org/wiki/Minimal_reproducible_example). For feature requests, please explain why you would find the feature valuable.

## Contributing

`use-dnd` uses [pnpm](https://pnpm.io/), which is probably easiest to install with `npm i -g pnpm` or [`corepack enable`](https://pnpm.io/installation#using-corepack) (Corepack comes with recent Node.js versions). Once pnpm is installed, run `pnpm i` to install `use-dnd`'s dependencies.

To test changes, go into the `demo` directory and run `pnpm i`, then `pnpm dev`. This will start up a [Next.js](https://nextjs.org/) dev server which will allow you to make changes with hot reload. Also run `pnpm watch` in the root directory so that `use-dnd` will be automatically recompiled when the source files are changed.

`use-dnd` uses [ESLint](https://eslint.org/), which can be run with `pnpm lint`.

Feel free to make a pull request with bug fixes. New features may be accepted directly from PR, but if you want to make sure then please make an issue about it first. You may state in your issue that you are willing to put in the development time yourself to let me know that the feature request would not require significant development work on my part.


## API

### Drag types

`use-dnd` provides types for items based on the item type. Add your own types through module augmentation:

```ts
declare module 'use-dnd' {
    interface DragTypeItemContentMap {
        'application/my-drag-type+json': MyItem;
        'application/my-drag-type2+json': MyItem2;
    }
}
```

### `DragDropProvider`

A context provider for `use-dnd`. All `use-dnd` hooks must be within the context (i.e. descendents of `DragDropProvider`). You should only need one `DragDropProvider`, likely near the root of your document.

⚠️ `DragDropProvider` does not currently support setting custom element roots other than `document`. Fortunately, due to the way `use-dnd` works, custom roots are less likely to be necessary than in `react-dnd`.

### `useDrag`

Make an element draggable with the `useDrag` hook. You can supply options using either a function and a dependency array or a plain object.

```ts
const [collected, drag, dragPreview] = useDrag(() => {
    type: 'application/my-drag-type+json',
    item: obj,
}, [obj]);
```

Make an element a drag handle by using its `ref` prop:

```tsx
<div ref={drag}>Drag me!</div>
```

If you want the drag handle and the drag preview to be separate, use the drag preview similarly:

```tsx
<div ref={dragPreview}><DragIcon ref={drag}/> Drag me!</div>
```

#### `type`

Type: `string`

The drag type of the item. `use-dnd` does not currently support using multiple drag types.

#### `item`

Type: `ItemContent<...>`

The item that is being dragged.

#### `serialize`

Type: `(item: ItemContent<...>) => string`  
Default: See below

A function to serialize the item into a string. By default, the identity if the type starts with `text/` and `JSON.stringify` otherwise. This is necessary if the item is not automatically serializable and you want it to be able to be picked up by foreign drop targets.

#### `startDragging`

Type: `(event: DragEvent) => void`  
Default: `undefined`

A callback which is fired when the item is initially picked up. This is the only time that `event.dataTransfer.effectAllowed` can be set.

#### `finishDragging`

Type: `(event: DragEvent) => void`  
Default: `undefined`

A callback which is fired when the item is no longer being dragged.

#### `collect`

Type: `(event?: DragEvent) => void`  
Default: `undefined`

A callback which is fired whenever an update occurs. If the item is not being dragged, `event` will be `undefined`. The first item in the hook result array will be the value returned by `collect`.

### `useDrop`

Make an element a drop target with the `useDrop` hook. You can supply options using either a function and a dependency array or a plain object.

```ts
const [{ isDragging }, drop] = useDrop(() => ({
    type: 'application/my-drag-type+json',
    collect: data => ({
        isDragging: Boolean(data.itemType),
    }),
    drop(data) {
        loadItem(data);
    }
}), [loadItem]);
```

#### `accept`

Type: `string | readonly string[] | null`

The drag type(s) which can be dropped on the target. Use `null` to accept all drag types.

#### `collect`

Type: `(info: CollectDragStatus) => Collected`  
Default: `undefined`

A callback which is fired whenever an update occurs. If an accepted item is not being dragged, `info` will be `{}`. The first item in the hook result array will be the value returned by `collect`.

Foreign objects are indicated by `info.item` being `undefined`.

#### `drop`

Type: `(info: DragStatus) => void`  
Default: `undefined`

A callback which is fired when an item is dropped on the target.

#### `hover`

Type: `(info: DragStatus) => void`  
Default: `undefined`

A callback which is fired when an item is hovered over the target.

Foreign objects are indicated by `info.item` being `undefined`.

#### `deserialize`

Type: `<ItemType extends ...>(type: ItemType, data: string) => ItemContent<ItemType>`  
Default: See below

A function to deserialize the item from a string. By default, the identity if the item type starts with `text/` and `JSON.parse` otherwise. This is necessary if the item is not automatically deserializable and you want to be able to pick up foreign objects.

#### `acceptForeign`

Type: `boolean`  
Default: `false`

If set to `true`, foreign items will be accepted. A foreign item is an item which is created by a drag source outside of the root, such as by another window or application. If set to `false`, foreign items will be treated the same as if they had a non-accepted item type.

### `useDragLayer`

Observe the currently dragged element with `useDragLayer`. Acts like `useDrop` but with no drop target and only the `type` and `collect` option.

```ts
const { isDragging, content, x, y } = useDragLayer(
    'application/my-drag-type+json',
    info => ({
        isDragging: Boolean(info.itemType),
        content: info.item,
        x: info.event?.clientX,
        y: info.event?.clientY,
    })
);
```

`useDragLayer` is useful for providing custom drag preview behavior.

#### `accept`

Type: `string | readonly string[] | null`

The drag type(s) which can be dropped on the target. Use `null` to accept all drag types.

#### `collect`

Type: `(info: CollectDragStatus) => Collected`

A callback which is fired whenever an update occurs. If an accepted item is not being dragged, `info` will be `{}`. The hook result will be the value returned by `collect`.

Foreign objects are indicated by `info.item` being `undefined`.

### `createEmptyPreviewImage`

This can be used in conjunction with the `dragPreview` from `useDrag` to hide the drag preview. This may be useful if you want to provide your own custom drag overlay, such as with `useDragLayer`.

```ts
const [, drag, dragPreview] = useDrag(...);

useEffect(() => {
    dragPreview(createEmptyPreviewImage());
}, [dragPreview]);
```
