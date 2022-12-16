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

class ParserManager {
    constructor() {
        this.parserCache = {};
    }

    /**
     * Return a list of parsers for the given file name extension
     *
     * @returns {Array.<Parser>} the array of parsers that handle
     * the given type of file
     */
    get(options) {
        const { extension } = options;
        let parserClasses = this.parserCache[extension];

        return parserClasses || [];
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
            const p = new parser({});
            for (const extension of p.getExtensions()) {
                if (!this.parserCache[extension]) {
                    this.parserCache[extension] = [];
                }
                this.parserCache[extension].push(parser);
            }
        }
    };

    // for use with the unit tests
    clear() {
        this.parserCache = {};
    }
}

export default ParserManager;