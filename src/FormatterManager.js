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

import log4js from 'log4js';

import { Formatter } from 'i18nlint-common';

import AnsiConsoleFormatter from './formatters/AnsiConsoleFormatter.js';

var logger = log4js.getLogger("i18nlint.FormatterManager");

/**
 * Return the formatter with the given name
 *
 * @returns {Array.<Formatter>} the array of parsers that handle
 * the given type of file
 */
class FormatterManager {
    constructor(options) {
        this.formatterCache = {};
        this.add([new AnsiConsoleFormatter()]);
    }

    /**
     * Return a formatter with the given name for use in
     * formatting the output.
     *
     * @param {String} name name of the formatter to return
     * @returns {Formatter} the formatter to use
     */
    get(name) {
        return this.formatterCache[name];
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
            if (formatter && typeof(formatter) === 'object' && formatter instanceof Formatter) {
                this.formatterCache[formatter.getName()] = formatter;
                logger.trace(`Added formatter ${formatter.getName()} to the formatter manager`);
            } else {
                logger.debug(`Attempt to add a non-formatter to the formatter manager`);
                if (typeof(formatter.getName) === 'function') logger.debug(`Name is ${formatter.getName()}`);
            }
        }
    }

    // for use with the unit tests
    clear() {
        this.formatterCache = {};
    }
}

export default FormatterManager;