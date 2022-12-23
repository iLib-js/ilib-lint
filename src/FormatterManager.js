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

const logger = log4js.getLogger("i18nlint.FormatterManager");

/**
 * Return the formatter with the given name
 *
 * @returns {Array.<Formatter>} the array of parsers that handle
 * the given type of file
 */
class FormatterManager {
    constructor(options) {
        this.formatterCache = {};
        this.add([AnsiConsoleFormatter]);
    }

    /**
     * Return a formatter instance with the given name for use in
     * formatting the output.
     *
     * @param {String} name name of the formatter to return
     * @param {Object|undefined} options options for this instance of the
     * formatter from the config file, if any
     * @returns {Formatter} the formatter to use
     */
    get(name, options) {
        const FormatterClass = this.formatterCache[name];
        return FormatterClass ? new FormatterClass(options) : undefined;
    }

    /**
     * Add a list of formatter classes to this factory so that other code
     * can find them.
     *
     * @param {Array.<Class>} formatters the list of formatter classes to add
     */
    add(formatters) {
        if (!formatters || !Array.isArray(formatters)) return;
        for (const fmt of formatters) {
            if (fmt && typeof(fmt) === 'function' && Object.getPrototypeOf(fmt).name === "Formatter") {
                const formatter = new fmt();
                this.formatterCache[formatter.getName()] = fmt;
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