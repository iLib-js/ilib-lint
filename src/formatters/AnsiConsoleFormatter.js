/*
 * AnsiConsoleFormatter.js - Formats result output
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

import Formatter from '../Formatter.js';

var logger = log4js.getLogger("i18nlint.formatters.AnsiConsoleFormatter");

/**
 * @class Represent an output formatter for an ANSI console/terminal
 * @abstract
 */
class AnsiConsoleFormatter extends Formatter {
    /**
     * Construct an formatter instance.
     */
    constructor() {
        super();
        this.name = "ansi-console-formatter";
    }

    /**
     * Return a general description of the formatter for use in help output.
     *
     * @returns {String} a general description of the formatter
     */
    getDescription() {
        return "Formats results for an ANSI terminal/console with colors.";
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
        let output = "";
        const startColor = (result.severity === "error" ? "\u001B[38:5:9m" : "\u001B[38:5:178m");
        output += `${result.pathName}${typeof(result.lineNumber) === "number" ? ('(' + result.lineNumber + ')') : ""}:
  ${startColor}${result.description}\u001B[0m\n`;
        if (result.id) {
            output += `  Key: ${result.id}\n`;
        }
        if (result.source) {
            output += `  Source: ${result.source}\n`;
        }
        output += `  ${result.highlight}
  Rule (${result.rule.getName()}): ${result.rule.getDescription()}
`;
        // output ascii terminal escape sequences
        output = output.replace(/<e\d><\/e\d>/g, "\u001B[48:5:9m \u001B[0m");
        output = output.replace(/<e\d>/g, "\u001B[38:5:9m");
        output = output.replace(/<\/e\d>/g, "\u001B[0m");
        return output;
    }
}

export default AnsiConsoleFormatter;
