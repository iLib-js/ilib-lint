/*
 * utils.js - utility functions for the rules
 *
 * Copyright © 2022 JEDLSoft
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
    const imf = new IntlMessageFormat(str, locale);
    const ast = imf.getAst();
    
    return concatText(ast).replace(/\s+/g, " ");
}