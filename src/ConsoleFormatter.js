/*
 * ConsoleFormatter.js - Formats result output for an ANSI terminal/console
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

import Formatter from './Formatter.js';

/**
 * @class Represent an output formatter
 * @abstract
 */
class ConsoleFormatter extends Formatter {
    /**
     * Construct an formatter instance. Formatters and formatter plugins
     * should implement this abstract class.
     */
    constructor() {
        this.name = "console";
        this.description = "Return a result formatted for an ANSI console/terminal with highlights shown in color";
    }

    /**
     * Format the given result with the current formatter and return the
     * formatted string.
     *
     * @override
     * @param {Object} result the result to format
     * @param {Rule} rule rule that produced this result
     * @returns {String} the formatted result
     */
    format(result, rule) {
        let output = "";
        if (result) {
            output = (result.type === "warning") ? "WARN " : "ERR  ";
            output += `${result.file}(${result.id}): ${rule.description}\n${result.description}\n${result.highlight}\n`;
            // output ascii terminal escape sequences
            output = output.replace(/<e\d>/g, "\033[31;");
            output = output.replace(/<\/e\d>/g, "\033[0;");
        }
        return output;
    }
}

export default ConsoleFormatter;
