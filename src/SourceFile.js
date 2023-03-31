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

import path from 'node:path';
import fs from 'node:fs';
import log4js from 'log4js';
import { getLocaleFromPath, TranslationSet } from 'ilib-tools-common';
import { IntermediateRepresentation } from 'i18nlint-common';

import DirItem from './DirItem.js';

const logger = log4js.getLogger("i18nlint.RuleSet");

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
     * @param {Project} project the project where this file is located
     */
    constructor(filePath, options, project) {
        super(filePath, options, project);
        if (!options || !filePath) {
            throw "Incorrect options given to SourceFile constructor";
        }
        this.filePath = filePath;
        this.type = "string";

        this.filetype = options.filetype;

        let parserClasses;
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
     * Parse the current source file into a list of resources (in the case of
     * resource files, or lines in the case of other types of files.
     * @param {Array.<Parser>} parsers parsers for the current source file
     * @returns {Array.<IntermediateRepresentation>} the parsed representations
     * of this file
     */
    parse() {
        if (!this.filePath) return;
        logger.trace(`===================\nParsing file ${this.filePath}`);
        if (this.parserClasses && this.parserClasses.length) {
            for (const parser of this.parserClasses) {
                const p = new parser({
                    filePath: this.filePath,
                    settings: this.settings
                });
                this.ir = this.ir.concat(p.parse());
                this.type = p.getType();
            }
        } else {
            const data = fs.readFileSync(this.filePath, "utf-8");
            if (this.filetype.getType() === "line") {
                this.type = "line";
                this.ir.push(new IntermediateRepresentation({
                    type: this.type,
                    ir: data.split(/\n/g),
                    filePath: this.filePath
                }));
            } else {
                this.type = "string";
                this.ir.push(new IntermediateRepresentation({
                    type: this.type,
                    ir: data,
                    filePath: this.filePath
                }));
            }
        }
        return this.ir;
    }

    /**
     * Check the current file and return a list of issues found in this file.
     * This method parses the source file and applies each rule in turn
     * using the given locales.
     *
     * @param {Array.<Locale>} locales a set of locales to apply
     * @returns {Array.<Result>} a list of natch results
     */
    findIssues(locales) {
        let issues = [], names, result;
        const detectedLocale = this.getLocaleFromPath();

        if (detectedLocale && locales.indexOf(detectedLocale) < -1) {
            // not one of the locales we need to check
            return issues;
        }

        const rules = this.filetype.getRules().filter(rule => (rule.getRuleType() === this.type));
        rules.forEach(rule => {
            this.ir.forEach(ir => {
                const representation = ir.getRepresentation();
                switch (ir.getType()) {
                case "line":
                    for (let i = 0; i < representation.length; i++) {
                        result = rule.match({
                            ir,
                            line: representation[i],
                            locale: detectedLocale || this.project.getSourceLocale(),
                            file: ir.getFilePath()
                        });
                        if (result) issues = issues.concat(makeArray(result));
                    }
                    break;
                case "resource":
                    representation.forEach(resource => {
                        logger.trace(`Applying rule ${rule.getName()} to resource ${resource.reskey}`);
                        result = rule.match({
                            ir,
                            locale: resource.getTargetLocale(),
                            resource,
                            file: this.filePath
                        });
                        if (result) issues = issues.concat(makeArray(result));
                    });
                    break;
                default:
                    // all other cases -- don't iterate, just call the rule
                    // with the whole intermediate representation
                    result = rule.match({
                        ir,
                        locale: detectedLocale || this.project.getSourceLocale()
                    });
                    if (result) issues = issues.concat(makeArray(result));
                }
            });
        });

        return issues;
    }
};

export default SourceFile;
