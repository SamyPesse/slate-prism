const Prism = require('prismjs');
const Slate = require('slate');
const React = require('react');

const MARK_TYPE = 'prism-token';

/**
 * Default filter for code blocks
 * @param {Node} node
 * @return {Boolean}
 */
function defaultOnlyIn(node) {
    return node.kind === 'block' && node.type === 'code_block';
}

/**
 * Default getter for syntax
 * @param {Node} node
 * @return {String}
 */
function defaultGetSyntax(node) {
    return 'javascript';
}

/**
 * Default rendering for tokens
 * @param {Object} props
 * @param {Slate.Mark} props.mark
 * @return {React.Element}
 */
function defaultTokenRender(props) {
    var { mark } = props;
    var className = mark.data.get('className');
    return <span className={className}>{props.children}</span>;
}

/**
 * A Slate plugin to handle keyboard events in code blocks.
 * @return {Object}
 */

function PrismPlugin(opts) {
    opts = opts || {};
    opts.onlyIn = opts.onlyIn || defaultOnlyIn;
    opts.getSyntax = opts.getSyntax || defaultGetSyntax;
    opts.renderToken = opts.renderToken || defaultTokenRender;
    opts.blockPerLine = opts.blockPerLine || false;

    let previousBlock;
    let previousTokens;

    function decorate(text, block) {
        let characters = text.characters.asMutable();
        const grammarName = opts.getSyntax(block);
        const grammar = Prism.languages[grammarName];
        let tokens;

        if (!grammar) {
            return text.characters;
        }

        if (opts.blockPerLine && block === previousBlock) {
            tokens = previousTokens;
        }

        else if (opts.blockPerLine) {
            const string = block.nodes.toArray().map(n => n.text).join('\n');
            tokens = Prism.tokenize(string, grammar);
            previousBlock = block;
            previousTokens = tokens;
        }

        else {
            const string = text.text;
            tokens = Prism.tokenize(string, grammar);
        }

        let o = 0;
        let start = opts.blockPerLine ? block.getOffset(text.key) : 0;
        let end = start + text.text.length;

        function addMark(s, e, className) {
            className = 'prism-token token ' + className;

            for (let i = s; i < e; i++) {
                let char = characters.get(i);
                let { marks } = char;
                marks = marks.add(Slate.Mark.create({ type: MARK_TYPE, data: { className } }));
                char = char.set('marks', marks);
                characters = characters.set(i, char);
            }
        }

        function getString(token) {
            if (typeof token === 'string') {
                return token;
            }

            if (typeof token.content === 'string') {
                return token.content;
            }

            return token.content.map(getString).join('');
        }

        function processToken(token, accu) {
            accu = accu || '';

            if (typeof token !== 'string' && typeof token.content !== 'string') {
                accu = accu + ' ' + token.type + ' ' + (token.alias || '');

                for (var i =0; i < token.content.length; i++) {
                    processToken(token.content[i], accu);
                }

                return
            }

            const string = getString(token);
            let length = string.length;

            if (opts.blockPerLine) {
                const newlines = (string.match(/\n/mg) || []).length;
                length -= newlines;
            }

            const offset = o;
            const nextOffset = offset + length;
            o = nextOffset;

            if (offset < start && nextOffset <= start) {
                return;
            }

            if (offset >= end) {
                return;
            }

            const gap = Math.max(start - offset, 0)
            let s = offset - start + gap;
            let e = nextOffset - start + gap;

            if (typeof token === 'string') {
                if (accu) {
                    addMark(s, e, accu);
                }
            }

            else {
                accu = accu + ' ' + token.type + ' ' + (token.alias || '');

                if (typeof token.content === 'string') {
                    addMark(s, e, accu);
                }
            }
        }

        for (var i =0; i < tokens.length; i++) {
            processToken(tokens[i]);
        }

        return characters.asImmutable();
    }

    return {
        schema: {
            rules: [
                {
                    match: opts.onlyIn,
                    decorate
                },
                {
                    match: (object) => {
                        return (object.kind === 'mark' && object.type === MARK_TYPE);
                    },
                    render: opts.renderToken
                }
            ]
        }
    };
}

module.exports = PrismPlugin;
