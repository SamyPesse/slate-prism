# slate-prism

[![NPM version](https://badge.fury.io/js/slate-prism.svg)](http://badge.fury.io/js/slate-prism)

A Slate plugin to highlight code blocks using PrismJS

### Install

```
npm install slate-prism
```

### Simple Usage

```js
import Prism from 'slate-prism'

const plugins = [
  Prism()
]
```

**Note:** You have to add a Prism theme CSS to your application.

#### Arguments

- ``[onlyIn: (Node) => boolean]`` — a filtering function to select code blocks.
- ``[getSyntax: (Node) => string]`` — a function to determine syntax for a code block.
