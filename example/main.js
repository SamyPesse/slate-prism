// @flow
/* global document */
/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';
import ReactDOM from 'react-dom';
import { Editor } from 'slate-react';
import PluginEditCode from 'slate-edit-code';
import PluginPrism from '../lib/';

import INITIAL_VALUE from './value';

const plugins = [
    PluginPrism({
        onlyIn: node => node.type === 'code_block',
        getSyntax: node => node.data.get('syntax')
    }),
    PluginEditCode({
        onlyIn: node => node.type === 'code_block'
    })
];

function renderNode(props: *) {
    const { node, children, attributes } = props;
    switch (node.type) {
        case 'code_block':
            return (
                <pre>
                    <code {...attributes}>{children}</code>
                </pre>
            );

        case 'paragraph':
            return <p {...attributes}>{children}</p>;
        case 'heading':
            return <h1 {...attributes}>{children}</h1>;
        default:
            return null;
    }
}

class Example extends React.Component<*, *> {
    state = {
        value: INITIAL_VALUE
    };

    onChange = ({ value }) => {
        this.setState({
            value
        });
    };

    render() {
        return (
            <Editor
                placeholder={'Enter some text...'}
                plugins={plugins}
                value={this.state.value}
                onChange={this.onChange}
                renderNode={renderNode}
            />
        );
    }
}

// $FlowFixMe
ReactDOM.render(<Example />, document.getElementById('example'));
