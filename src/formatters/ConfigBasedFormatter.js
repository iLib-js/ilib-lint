/*
 * ConfigBasedFormatter.js - Formats result output
 *
 * Copyright © 2023 JEDLSoft
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

var logger = log4js.getLogger("ilib-lint.formatters.ConfigBasedFormatter");

export const requiredFields = [
    "name",
    "description",
    "template",
    "highlightStart",
    "highlightEnd"
];

const resultFields = [
    "severity",
    "pathName",
    "lineNumber",
    "description",
    "source",
    "highlight",
    "id"
];

/**
 * @class Represent an output formatter for an ANSI console/terminal
 * @abstract
 */
export class ConfigBasedFormatter extends Formatter {
    /**
     * Construct an formatter instance.
     */
    constructor(options) {
        super(options);
        
        if (!options) {
            throw "Attempt to create a ConfigBasedFormatter without options";
        }

        for (let prop of requiredFields) {
            if (typeof(options[prop]) === 'undefined') {
                throw `Missing ${prop} field for a ConfigBasedFormatter`;
            }
            this[prop] = options[prop];
        }
    }

    /**
     * Format the given result with the current formatter and return the
     * formatted string.
     *
     * @abstract
     * @param {Result} result the result to format
     * @returns {String} the formatted result
     */
    format(result) {
        if (!result) return;
        let output = this.template;
        
        for (let prop of resultFields) {
            output = output.replaceAll(`{${prop}}`, result[prop]);
        }
        output = output.replaceAll("{ruleName}", result.rule.getName());
        output = output.replaceAll("{ruleDescription}", result.rule.getDescription());

        output = output.replace(/<e\d><\/e\d>/g, `${this.highlightStart}${this.highlightEnd}`);
        output = output.replace(/<e\d>/g, this.highlightStart);
        output = output.replace(/<\/e\d>/g, this.highlightEnd);
        return output;
    }
}
