const React = require('react');
const ReactDOM = require('react-dom');
const { Editor } = require('slate-react');
const PluginEditCode = require('slate-edit-code');
const PluginPrism = require('../lib/');

const initialState = require('./state');

const plugins = [
    PluginPrism({
        onlyIn: (node => node.type === 'code_block'),
        getSyntax: (node => node.data.get('syntax'))
    }),
    PluginEditCode({
        onlyIn: (node => node.type === 'code_block')
    })
];

/**
 * Define a schema.
 *
 * @type {Object}
 */

const schema = {
    nodes: {
        code_block: {
            render: props => <pre><code {...props.attributes}>{props.children}</code></pre>
        },
        paragraph: {
            render: props => <p {...props.attributes}>{props.children}</p>
        },
        heading: {
            render: props => <h1 {...props.attributes}>{props.children}</h1>
        }
    }
};

const Example = React.createClass({
    getInitialState: function() {
        return {
            state: initialState
        };
    },

    onChange: function({ state }) {
        this.setState({
            state: state
        });
    },

    render: function() {
        return (
            <Editor
                placeholder={'Enter some text...'}
                plugins={plugins}
                state={this.state.state}
                onChange={this.onChange}
                schema={schema}
            />
        );
    }
});

ReactDOM.render(
    <Example />,
    document.getElementById('example')
);
