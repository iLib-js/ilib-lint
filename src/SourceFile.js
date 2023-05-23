/*
 * SourceFile.js - Represent a source file
 *
 * Copyright © 2022-2023 JEDLSoft
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

import path from "node:path";
import log4js from "log4js";
import { getLocaleFromPath } from "ilib-tools-common";
import { Fix, IntermediateRepresentation, Parser, Result } from "i18nlint-common";

import DirItem from "./DirItem.js";
import Project from "./Project.js";
import FileType from "./FileType.js";

const logger = log4js.getLogger("i18nlint.RuleSet");

/**
 * @class Represent a source file
 */
class SourceFile extends DirItem {
    /**
     * Construct a source file instance
     * The options parameter can contain any of the following properties:
     *
     *
     * @constructor
     * @param {String} filePath path to the source file
     * @param {Object} options options for constructing this source file
     * @param {FileType} options.filetype file type of this source file
     * @param {String} options.filePath path to the file
     * @param {object} [options.settings] the settings from the i18nlint config that apply to this file
     * @param {Project} project the project where this file is located
     */
    constructor(filePath, options, project) {
        super(filePath, options, project);
        if (!options || !filePath) {
            throw "Incorrect options given to SourceFile constructor";
        }
        this.filePath = filePath;

        this.filetype = options.filetype;

        /** @type {(typeof Parser)[]} */
        this.parserClasses = [];
        let extension = path.extname(this.filePath);
        if (extension) {
            // remove the dot
            extension = extension.substring(1);
            const pm = project.getParserManager();
            this.parserClasses = pm.get(extension);
        }
    }

    /**
     * Return the locale gleaned from the file path using the template in
     * the settings, or undefined if no locale could be found.
     *
     * @returns {String} the locale gleaned from the path, or the empty
     * string if no locale could be found.
     */
    getLocaleFromPath() {
        if (this.settings && this.settings.template) {
            return getLocaleFromPath(this.settings.template, this.filePath);
        }
        return "";
    }

    /**
     * @private 
     * @returns {Parser[]}
    */
    getParsers() {
        return this.parserClasses.map(parserClass => {
            return new parserClass({
                filePath: this.filePath,
                settings: this.settings,
                getLogger: (name) => log4js.getLogger(name)
            });
        });
    }

    /**
     * Parse the current source file into a list of Intermediate Representaitons
     * @returns {Array.<IntermediateRepresentation>} the parsed representations
     * of this file
     */
    parse() {
        if (!this.filePath) return [];
        return this.getParsers().flatMap(parser => parser.parse());
    }

    /**
     * Check the current file and return a list of issues found in this file.
     * This method parses the source file and applies each rule in turn
     * using the given locales.
     *
     * @param {Array.<string>} locales a set of locales to apply
     * @returns {Array.<Result>} a list of natch results
     */
    findIssues(locales) {
        const detectedLocale = this.getLocaleFromPath();

        if (detectedLocale && !locales.includes(detectedLocale)) {
            // not one of the locales we need to check
            return [];
        }

        if (!this.filePath) return [];
        return this.getParsers().flatMap(parser => {
            const irs = parser.parse();

            return irs.flatMap(ir => {
                // find the rules that are appropriate for this intermediate representation and then apply them
                const rules = this.filetype.getRules().filter(rule => (rule.getRuleType() === ir.getType()));
                
                // apply rules
                const results = rules.flatMap(rule => rule.match({
                    ir,
                    locale: detectedLocale || this.project.getSourceLocale(),
                    file: this.filePath
                }) ?? []);
                
                if (! /* @TODO check if the autofixing is enabled at all */ true) {
                    return results;
                }
                
                const fixable = results.filter(result => result.fix !== undefined);
                if (!(fixable.length > 0)) {
                    return results;
                }

                const fixer = this.project.getFixerManager().get(ir.getType());
                if (undefined === fixer) {
                    logger.trace(`Cannot get fixer for IR of type ${ir.type}`);
                    return results;

                }

                const fixes = /** @type {Fix[]} */ (fixable.map(result => result.fix));
                fixer.applyFixes(ir, fixes);
                // fixer should modify the IR
                // so tell current parser to write out the modified representation
                parser.write(ir);

                // fixer should also have set the `applied` flag of each applied Fix
                // so we can just return the results
                return results;
            });
        });
    }
};

export default SourceFile;
