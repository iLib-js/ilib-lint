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
import { IntermediateRepresentation, Parser, Result } from "i18nlint-common";

import DirItem from "./DirItem.js";
import Project from "./Project.js";
import FileType from "./FileType.js";

const logger = log4js.getLogger("i18nlint.RuleSet");

/**
 * If it's not already an array, make it an array!
 * @private
 */
function makeArray(obj) {
    if (!obj) return [];
    if (Array.isArray(obj)) return obj;
    return [ obj ];
}

/**
 * @class Represent a source file
 */
class SourceFile extends DirItem {
    /**
     * Construct a source file instance
     * The options parameter can contain any of the following properties:
     *
     * - filePath {String} path to the file
     *
     * @constructor
     * @param {String} filePath path to the source file
     * @param {Object} options options for constructing this source file
     * @param {object} [options.settings] the settings from the i18nlint config that apply to this file
     * @param {FileType} options.filetype file type of this source file
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

        // the intermediate representations are an array because some
        // file types can be parsed by multiple parsers. For example,
        // a single HTML file may be parsed by the HTML parser, the
        // Javascript parser, and the CSS parser. Each would have
        // their own representation of what's in the file.
        /** @type {IntermediateRepresentation[]} */
        this.ir = [];
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
     * Parse the current source file into a list of Intermediate Representaitons
     * and populate {@link SourceFile.ir}.
     * @returns {Array.<IntermediateRepresentation>} the parsed representations
     * of this file
     */
    parse() {
        if (!this.filePath) return [];
        logger.trace(`===================\nParsing file ${this.filePath}`);
        for (const parser of this.parserClasses) {
            const p = new parser({
                filePath: this.filePath,
                settings: this.settings,
                getLogger: (name) => log4js.getLogger(name)
            });
            this.ir = this.ir.concat(p.parse());
        }
        return this.ir;
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
        let issues = [], names, result;
        const detectedLocale = this.getLocaleFromPath();

        if (detectedLocale && locales.indexOf(detectedLocale) < -1) {
            // not one of the locales we need to check
            return issues;
        }

        this.ir.forEach(ir => {
            // find the rules that are appropriate for this intermediate representation and then apply them
            const rules = this.filetype.getRules().filter(rule => (rule.getRuleType() === ir.getType()));
            rules.forEach(rule => {
                result = rule.match({
                    ir,
                    locale: detectedLocale || this.project.getSourceLocale(),
                    file: this.filePath
                });
                if (result) issues = issues.concat(makeArray(result));
            });
        });

        return issues;
    }
};

export default SourceFile;
