/** @jsx h */
const createHyperscript = require('slate-sugar').default;

const h = createHyperscript({
    blocks: {
        heading: 'heading',
        paragraph: 'paragraph',
        'codeblock': 'code_block',
        'codeline': 'code_line'
    }
});

module.exports = (
    <document>
        <heading>Slate + Code Edition</heading>
        <paragraph>This page is a basic example of Slate + slate-prism + slate-edit-code plugins:</paragraph>
        <codeblock syntax="javascript">
            <codeline>{'// Some javascript'}</codeline>
            <codeline>{'var msg = \'Hello world\';'}</codeline>
        </codeblock>

        <paragraph>Syntax can be set on a per-block basis:</paragraph>
        <codeblock syntax="html">
            <codeline>{'<!-- Some HTML -->'}</codeline>
            <codeline>{'<b>Hello World</b>'}</codeline>
        </codeblock>
    </document>
);
