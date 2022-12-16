/*
 * ParserManager.js - Factory to create and return the right parser for the file
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

import log4js from 'log4js';

import { Parser } from 'i18nlint-common';

var logger = log4js.getLogger("i18nlint.ParserManager");

function getSuperClassName(obj) {
    return Object.getPrototypeOf(Object.getPrototypeOf(obj)).constructor.name;
}

class ParserManager {
    constructor() {
        this.parserCache = {};
    }

    /**
     * Return a list of parsers for the given file name extension
     *
     * @param {String} extension the extension to get the parsers for
     * @returns {Array.<Parser>} the array of parsers that handle
     * the given type of file
     */
    get(extension) {
        return this.parserCache[extension] || [];
    }

    /**
     * Add a list of parsers to this factory so that other code
     * can find them.
     *
     * @param {Array.<Parser>} parsers the list of parsers to add
     */
    add(parsers) {
        if (!parsers || !Array.isArray(parsers)) return;
        for (const parser of parsers) {
            if (parser && typeof(parser) === 'function' && Object.getPrototypeOf(parser).name === "Parser") {
                const p = new parser({});
                for (const extension of p.getExtensions()) {
                    if (!this.parserCache[extension]) {
                        this.parserCache[extension] = [];
                    }
                    this.parserCache[extension].push(parser);
                }
                logger.trace(`Added parser to the parser manager.`);
            } else {
                logger.debug("Attempt to add parser that does not inherit from Parser to the parser manager");
            }
        }
    };

    // for use with the unit tests
    clear() {
        this.parserCache = {};
    }
}

export default ParserManager;