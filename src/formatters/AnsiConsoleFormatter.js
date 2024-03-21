/*
 * AnsiConsoleFormatter.js - Formats result output
 *
 * Copyright © 2022-2024 JEDLSoft
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

import { Formatter, Result } from 'ilib-lint-common';

var logger = log4js.getLogger("ilib-lint.formatters.AnsiConsoleFormatter");

/**
 * @class Represent an output formatter for an ANSI console/terminal
 */
class AnsiConsoleFormatter extends Formatter {
    /**
     * Construct an formatter instance.
     * @constructor
     */
    constructor(options) {
        super(options);
        this.name = "ansi-console-formatter";
        this.description = "Formats results for an ANSI terminal/console with colors.";
    }

    /**
     * Format the given result with the current formatter and return the
     * formatted string.
     *
     * @param {Result} result the result to format
     * @returns {String} the formatted result
     */
    format(result) {
        if (!result) return "";
        let output = "";
        const startColor = (result.severity === "error" ? "\u001B[91m" : "\u001B[33m");
        output += `${result.pathName}${typeof(result.lineNumber) === "number" ? ('(' + result.lineNumber + ')') : ""}:
  ${startColor}${result.description}\u001B[0m\n`;
        if (result.id) {
            output += `  Key: ${result.id}\n`;
        }
        if (result.source) {
            output += `  Source: ${result.source}\n`;
        }
        output += `  ${result.highlight}
  Auto-fix: ${result.fix === undefined ? "unavailable" : result.fix.applied ? "\u001b[92mapplied" : "\u001B[91mnot applied"}\u001B[0m
  Rule (${result.rule.getName()}): ${result.rule.getDescription()}
`;

        // output ascii terminal escape sequences
        output = output.replace(/<e\d><\/e\d>/g, "\u001B[91m \u001B[0m");
        output = output.replace(/<e\d>/g, "\u001B[91m");
        output = output.replace(/<\/e\d>/g, "\u001B[0m");
        if (typeof(result.rule.getLink) === 'function' && result.rule.getLink()) {
            output += `  More info: ${result.rule.getLink()}\n`;
        }
        return output;
    }

    formatOutput(options){
        let prjName, totalTime, fileStats, score, resultStats, results, errorsOnly;

        if (options) {
            prjName = options.name;
            totalTime = options.time;
            fileStats = options.fileStats;
            resultStats = options.resultStats;
            results = options.results;
            score = options.score;
            errorsOnly = options.errorOnly;
        }

        if (results) {
            results.forEach(result => {
                const str = this.format(result);
                if (str) {
                    if (result.severity === "error") {
                        logger.error(str);
                        resultStats.errors++;
                    } else if (result.severity === "warning") {
                        resultStats.warnings++;
                        if (!errorsOnly) {
                            logger.warn(str);
                        }
                    } else {
                        resultStats.suggestions++;
                        if (!this.options.errorsOnly) {
                            logger.info(str);
                        }
                    }
                }
            });
        }

        const fmt = new Intl.NumberFormat("en-US", {
            maxFractionDigits: 2
        });

        logger.info(`Total Elapse Time: ${String(totalTime)} seconds`);
        logger.info(`                             ${`Average over`.padEnd(15, ' ')}${`Average over`.padEnd(15, ' ')}${`Average over`.padEnd(15, ' ')}`);
        logger.info(`                   Total     ${`${String(fileStats.files)} Files`.padEnd(15, ' ')}${`${String(fileStats.modules)} Modules`.padEnd(15, ' ')}${`${String(fileStats.lines)} Lines`.padEnd(15, ' ')}`);
        if (results.length) {
            logger.info(
                    `Errors:            ${String(resultStats.errors).padEnd(10, ' ')}${fmt.format(resultStats.errors/fileStats.files).padEnd(15, ' ')}${fmt.format(resultStats.errors/fileStats.modules).padEnd(15, ' ')}${fmt.format(resultStats.errors/fileStats.lines).padEnd(15, ' ')}`);
            if (!errorsOnly) {
                logger.info(
                    `Warnings:          ${String(resultStats.warnings).padEnd(10, ' ')}${fmt.format(resultStats.warnings/fileStats.files).padEnd(15, ' ')}${fmt.format(resultStats.warnings/fileStats.modules).padEnd(15, ' ')}${fmt.format(resultStats.warnings/fileStats.lines).padEnd(15, ' ')}`);
                logger.info(
                    `Suggestions:       ${String(resultStats.suggestions).padEnd(10, ' ')}${fmt.format(resultStats.suggestions/fileStats.files).padEnd(15, ' ')}${fmt.format(resultStats.suggestions/fileStats.modules).padEnd(15, ' ')}${fmt.format(resultStats.suggestions/fileStats.lines).padEnd(15, ' ')}`);
            }
        }
        logger.info(`I18N Score (0-100) ${fmt.format(score)}`);
    }
}

export default AnsiConsoleFormatter;
