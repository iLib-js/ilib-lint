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

function processNode(node) {
    let text = "";
    switch (node.type) {
        case 0:
            text = node.value;
            break;

        // Actual parameter
        case 1:
            text = `{${node.value}}`;
            break;

        case 6:
            if (node.options) {
                text = Object.keys(node.options).map(category => {
                    return concatText(node.options[category].value);
                }).join(" ");
            }
            break;
    }

    if (node.children) {
        text += concatText(node.children);
    }

    return text;
}

function concatText(ast) {
    if (!ast) return "";

    let result = "";

    if (Array.isArray(ast)) {
        result += ast.map(node => {
            return processNode(node);
        }).join(" ");
    } else if (typeof(ast) === "Object") {
        result = processNode(node);
    } else if (typeof(ast) === "string") {
        result = ast;
    } // else just ignore

    return result;
}

export function stripPlurals(str, locale) {
    try {
        const imf = new IntlMessageFormat(str, locale);
        const ast = imf.getAst();

        return concatText(ast).replace(/\s+/g, " ");
    } catch (e) {
        // punt
        return str;
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