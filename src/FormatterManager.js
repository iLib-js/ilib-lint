/*
 * FormatterManager.js - Factory to create and return the right formatter
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

import AnsiConsoleFormatter from './formatters/AnsiConsoleFormatter.js';

const 

const cfmt = new AnsiConsoleFormatter();
formatterCache[cfmt.getName()] = cfmt;

/**
 * Return the formatter with the given name
 *
 * @returns {Array.<Formatter>} the array of parsers that handle
 * the given type of file
 */
class FormatterManager {
    constructor(options) {
        this.formatterCache = {};
    }

    /**
     * Return a list of parsers for the given file name extension
     *
     * @returns {Array.<Parser>} the array of parsers that handle
     * the given type of file
     */
    get(options) {
        const { formatter } = options || {};
        
        return this.formatterCache[formatter] || [];
    }

    /**
     * Add a list of formatters to this factory so that other code
     * can find them.
     *
     * @param {Array.<Formatter>} formatters the list of formatters to add
     */
    add(formatters) {
        if (!formatters || !Array.isArray(formatters)) return;
        for (const formatter of formatters) {
            this.formatterCache[formatter.getName()] = formatter;
        }
    }

    // for use with the unit tests
    clear() {
        this.formatterCache = {};
    }
}

export default FormatterManager;