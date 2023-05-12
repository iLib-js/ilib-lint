/*
 * utils.js - utility functions for the rules
 *
 * Copyright © 2022-2023 JEDLSoft
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { IntlMessageFormat } from 'intl-messageformat';

/** @returns {string} */
function concatIntlAstText(/** @type {import("@formatjs/icu-messageformat-parser").MessageFormatElement[]} */ astElements, stripEntirePlural) {
    return astElements
        .map((element) => {
            switch (element.type) {
                case 0: // literal
                    return element.value;
                case 1: // argument
                    return "{" + element.value + "}";
                case 5: // select
                case 6: // plural
                    if (stripEntirePlural) return "";
                    // take each variation of a given plural, recursively convert its ast to text,
                    // then join all stripped variants into single string separating them by single space
                    return Object.values(element.options)
                        .map((pluralOption) => concatIntlAstText(pluralOption.value, stripEntirePlural))
                        .join(" ");
                case 8: // tag
                    // recursively process elements inside of a tag
                    return concatIntlAstText(element.children, stripEntirePlural);
                default:
                    return "value" in element ? element.value : "";
            }
        })
        .join("");
};

export function stripPlurals(/** @type {string} */ message, /** @type {string} */ locale, stripEntirePlural) {
    try {
        const imf = new IntlMessageFormat(message, locale);
        const ast = imf.getAst();
        return concatIntlAstText(ast, stripEntirePlural);
    } catch (e) {
        // punt
        return message;
    }
}

export function wrap(text, length) {
    // already short enough?
    if (text.length < length) return [text];

    let output = [];

    for (let i = length; i > 0; i--) {
        if (text[i] === ' ' || text[i] === '\t') {
            output.push(text.substring(0, i));
            output.push(text.substring(i+1));
            return output;
        }
    }

    // no spaces? Just cut it off
    output.push(text.substring(0, length - index.length));
    output.push(text.substring(length - index.length));
    return output;
}

const spaces = "                                                     ";

export function indent(arr, length) {
    arr[0] = spaces.substring(0, length) + arr[0];
    for (let i = 1; i < arr.length; i++) {
        arr[i] = spaces.substring(0, 2*length) + arr[i];
    }
    return arr;
}


/**
 * Match a regular expression against source and target strings that may
 * have plurals in them. If there are plurals, here are the rules for
 * matching:<p>
 *
 * <ol>
 * <li>If all of the categories in the source match the regular expression,
 * then all of the categories in the target must match as well
 * <li>If only some of the categories match in the source, then the
 * corresponding categories in the target must match if they exist
 * <li>If the regular expression does not match the source string, the
 * target string is not checked and no problem is returned
 * </ol>
 *
 * For nested plurals, the regular expression is only matched at the current
 * level. That is, if there is a plural category that contains another plural
 * inside of it, then the inner plural is stripped out of the string before
 * the matching occurs. That way, additional or missing categories in the
 * subplural do not affect the matching in the current level.<p>
 *
 * Example: let's say there is a rule that is looking for replacement
 * parameters that match in the source and target.<p>
 *
 * <code>
 * "There are {fileCount, plural,
 *    one {{fileCount} file with {folderCount, plural,
 *        one {{folderCount} folder}
 *        other {{folderCount} folders}
 *    }
 *    other {{fileCount} files with {folderCount, plural,
 *        one {{folderCount} folder}
 *        other {{folderCount} folders}
 *    }} in this folder."
 * </code>
 *
 * In this example string, the outer plural can ignore the inner plural when doing
 * the checking. That is, the categories in the target string must all
 * contain "{fileCount}" in the outer plural, and it ignores the text
 * in the inner plural while doing that matching. Also, all of the categories
 * in the inner plural must contain "{folderCount}" while ignoring all of
 * the text outside of the inner plurals.<p>
 *
 * Importantly, the syntax of the plurals themselves are not checked. That is,
 * if the regular expression is searching for the word "plural", it will not
 * match in that example source string just because it contains the word "plural"
 * in the plural syntax itself.<p>
 *
 * The results of this function are an array of problems that can
 * be converted into Results in the caller function. Each problem is
 * an object which contains the following properties:
 *
 * <ul>
 * <li>source - the source string at the current level which matched
 * the regular expression
 * <li>match - the part of the source string which the regular expression
 * matched
 * <li>target - the target string at the current level which did NOT
 * match the regular expression
 * <li>category - if the matching failed inside of a plural, this gives
 * the name of the target plural category where the check failed. If
 * the failure was outside of a plural, then this property will not be
 * given
 * </ul>
 *
 * @param {RegExp} re the regular expression to check for
 * @param {String} source the source string to check
 * @param {String} target the target string to check
 * @returns {Array.<Object>} an array of problems found in this match
 */
matchPlurals(re, source, target) {
}