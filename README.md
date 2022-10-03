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
