// @flow
import * as React from 'react';
import { type Mark, type Node } from 'slate';
import { Record } from 'immutable';

import TOKEN_MARK from './TOKEN_MARK';

export type OptionsFormat = {
    // Determine which node should be highlighted
    onlyIn?: Node => boolean,
    // Returns the syntax for a node that should be highlighted
    getSyntax?: Node => string,
    // Render a highlighting mark in a highlighted node
    renderMark?: ({ mark: Mark, children: React.Node }) => React.Node
};

/**
 * Default filter for code blocks
 */
function defaultOnlyIn(node: Node): boolean {
    return node.object === 'block' && node.type === 'code_block';
}

/**
 * Default getter for syntax
 */
function defaultGetSyntax(node: Node): string {
    return 'javascript';
}

/**
 * Default rendering for marks
 */
function defaultRenderMark(props: {
    children: React.Node,
    mark: Mark
}): void | React.Node {
    const { mark } = props;
    if (mark.type !== TOKEN_MARK) {
        return undefined;
    }
    const className = mark.data.get('className');
    return <span className={className}>{props.children}</span>;
}

/**
 * The plugin options
 */
class Options extends Record({
    onlyIn: defaultOnlyIn,
    getSyntax: defaultGetSyntax,
    renderMark: defaultRenderMark
}) {
    onlyIn: Node => boolean;
    getSyntax: Node => string;
    renderMark: ({ mark: Mark, children: React.Node }) => React.Node;
}

export default Options;
