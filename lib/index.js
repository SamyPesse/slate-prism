// @flow
import Prism from 'prismjs';
import { type Node, type Text, type Range } from 'slate';

import Options, { type OptionsFormat } from './options';
import TOKEN_MARK from './TOKEN_MARK';

/**
 * A Slate plugin to highlight code syntax.
 */
function PrismPlugin(optsParam: OptionsFormat = {}) {
    const opts: Options = new Options(optsParam);

    return {
        decorateNode: (node: Node) => {
            if (!opts.onlyIn(node)) {
                return undefined;
            }
            return decorateNode(opts, node);
        },

        renderMark: opts.renderMark,

        TOKEN_MARK
    };
}

/**
 * Returns the decoration for a node
 */
function decorateNode(opts: Options, block: Node) {
    const grammarName = opts.getSyntax(block);
    const grammar = Prism.languages[grammarName];
    if (!grammar) {
        // Grammar not loaded
        return [];
    }

    // Tokenize the whole block text
    const texts = block.getTexts();
    const blockText = texts.map(t => t.text).join('\n');
    const tokens = Prism.tokenize(blockText, grammar);

    // The list of decorations to return
    const decorations = [];
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
                        className: `prism-token token ${accu}`
                    });
                    if (decoration) {
                        decorations.push(decoration);
                    }
                }
                offset += token.length;
            } else {
                accu = `${accu} ${token.type} ${token.alias || ''}`;

                if (typeof token.content === 'string') {
                    const decoration = createDecoration({
                        text,
                        textStart,
                        textEnd,
                        start: offset,
                        end: offset + token.content.length,
                        className: `prism-token token ${accu}`
                    });
                    if (decoration) {
                        decorations.push(decoration);
                    }

                    offset += token.content.length;
                } else {
                    // When using token.content instead of token.matchedStr, token can be deep
                    for (let i = 0; i < token.content.length; i += 1) {
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

/**
 * Return a decoration range for the given text.
 */
function createDecoration({
    text,
    textStart,
    textEnd,
    start,
    end,
    className
}: {
    text: Text, // The text being decorated
    textStart: number, // Its start position in the whole text
    textEnd: number, // Its end position in the whole text
    start: number, // The position in the whole text where the token starts
    end: number, // The position in the whole text where the token ends
    className: string // The prism token classname
}): ?Range {
    if (start >= textEnd || end <= textStart) {
        // Ignore, the token is not in the text
        return null;
    }

    // Shrink to this text boundaries
    start = Math.max(start, textStart);
    end = Math.min(end, textEnd);

    // Now shift offsets to be relative to this text
    start -= textStart;
    end -= textStart;

    return {
        anchorKey: text.key,
        anchorOffset: start,
        focusKey: text.key,
        focusOffset: end,
        marks: [{ type: 'prism-token', data: { className } }]
    };
}

export default PrismPlugin;
