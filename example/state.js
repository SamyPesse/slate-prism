/** @jsx h */

const { createHyperscript } = require('slate-hyperscript');

const h = createHyperscript({
    blocks: {
        paragraph: 'paragraph',
        heading: 'heading',
        codeblock: 'code_block',
        codeline: 'code_line'
    },
    inlines: {},
    marks: {}
});

module.exports = (
    <state>
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
    </state>
);
