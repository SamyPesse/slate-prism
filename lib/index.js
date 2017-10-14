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
    const { mark } = props;
    const className = mark.data.get('className');
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

    function decorate(block) {
        const grammarName = opts.getSyntax(block);
        const grammar = Prism.languages[grammarName];
        if (!grammar) {
            return [];
        }

        // Tokenize the whole block text
        const texts = block.getTexts();
        const blockText = texts.map(t => t.text).join('\n');
        const tokens = Prism.tokenize(blockText, grammar);

        // The list of decorations to return
        let decorations = [];
        let textStart = 0;
        let textEnd = 0;

        texts.forEach(text => {
            textEnd = textStart + text.text.length;

            let offset = 0;

            function processToken(token, accu) {
                accu = accu || '';

                if (typeof token === 'string') {
                    if (accu) {
                        const decoration = createDecoration({
                            text,
                            textStart,
                            textEnd,
                            start: offset,
                            end: offset + token.length,
                            className: 'prism-token token ' + accu
                        });
                        if (decoration) {
                            decorations.push(decoration);
                        }
                    }
                    offset += token.length;
                }

                else {
                    accu = accu + ' ' + token.type + ' ' + (token.alias || '');

                    if (typeof token.content === 'string') {
                        const decoration = createDecoration({
                            text,
                            textStart,
                            textEnd,
                            start: offset,
                            end: offset + token.content.length,
                            className: 'prism-token token ' + accu
                        });
                        if (decoration) {
                            decorations.push(decoration);
                        }

                        offset += token.content.length;
                    }

                    // When using token.content instead of token.matchedStr, token can be deep
                    else {
                        for (let i =0; i < token.content.length; i++) {
                            processToken(token.content[i], accu);
                        }
                    }
                }
            }

            tokens.forEach(processToken);
            textStart = textEnd + 1; // account for added `\n`
        });

        return decorations;
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

/**
 * Return a decoration range for the given text.
 */
function createDecoration({
    text, // The text being decorated
    textStart, // Its start position in the whole text
    textEnd, // Its end position in the whole text
    start, // The position in the whole text where the token starts
    end, // The position in the whole text where the token ends
    className // The prism token classname
}) {
    if (start >= textEnd || end <= textStart) {
        // Ignore, the token is not in the text
        return;
    }

    // Shrink to this text boundaries
    start = Math.max(start, textStart);
    end = Math.min(end, textEnd);

    // Now shift offsets to be relative to this text
    start = start - textStart;
    end = end - textStart;

    return {
        anchorKey: text.key,
        anchorOffset: start,
        focusKey: text.key,
        focusOffset: end,
        marks: [{ type: 'prism-token', data: { className }}]
    };
}

module.exports = PrismPlugin;
