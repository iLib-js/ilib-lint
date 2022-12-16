/*
 * ParserFactory.js - Factory to create and return the right parser for the file
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

import XliffPlugin from './plugins/XliffPlugin.js';

const parserCache = {};

const xp = new XliffPlugin();
const extensions = xp.getExtensions();
const xpParsers = xp.getParsers();
extensions.forEach(ext => {
    parserCache[ext] = xpParsers;
});

/**
 * Return a list of parsers for the given file name extension
 *
 * @returns {Array.<Parser>} the array of parsers that handle
 * the given type of file
 */
function ParserFactory(options) {
    const { extension } = options;
    let parserClasses = parserCache[extension];

    return parserClasses || [];
}

/**
 * Add a list of parsers to this factory so that other code
 * can find them.
 *
 * @param {Array.<Parser>} parsers the list of parsers to add
 */
export function addParsers(parsers) {
    if (!parsers || !Array.isArray(parsers)) return;
    for (const parser of parsers) {
        for (const extension of parser.getExtensions()) {
            if (!parserCache[extension]) {
                parserCache[extension] = [];
            }
            parserCache[extension].push(parser);
        }
    }
};

export default ParserFactory;