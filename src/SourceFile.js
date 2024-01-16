/*
 * SourceFile.js - Represent a source file
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
     * @param {object} [options.settings] additional settings from the i18nlint config that apply to this file
     * @param {Project} project the project where this file is located
     */
    constructor(filePath, options, project) {
        super(filePath, options, project);
        if (!options || !filePath) {
            throw "Incorrect options given to SourceFile constructor";
        }
        this.filePath = filePath;

        this.filetype = options.filetype;

        /** @typedef {Class} ParserClass Constructor of {@link Parser} or its subclass */
        /** @type {ParserClass[]} */
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
        return this.parserClasses.map((parserClass) => {
            return new parserClass({
                filePath: this.filePath,
                settings: this.settings,
                getLogger: (name) => log4js.getLogger(name),
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
        return this.getParsers().flatMap((parser) => parser.parse());
    }

    /**
     * Check the current file and return a list of issues found in this file.
     * This method parses the source file and applies each rule in turn
     * using the given locales. Optionally, it also applies the available auto-fixes
     * and overwrites the underlying file depending if it's enabled in the project config options.
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
        return this.getParsers().flatMap((parser) => {
            let didWrite = false;

            const /** @type {Result[]} */ fixedResults = [];
            let /** @type {Result[]} */ currentParseResults = [];

            do {
                const irs = parser.parse();
                // indicate that for current intermediate representations, parser did not write out modified representations yet
                didWrite = false;
                // clear the results of the current parse, because the file had been overwritten
                // (so the results don't match the file anymore)
                currentParseResults = [];

                for (const ir of irs) {
                    // find the rules that are appropriate for this intermediate representation and then apply them
                    const rules = this.filetype.getRules().filter((rule) => rule.getRuleType() === ir.getType());
                    if (!(this.project.options.opt.quiet) && this.project.options.opt.progressInfo) {
                        rules.forEach(function(ru){
                            logger.info("Checking rule  : " + ru.name);
                        })
                        logger.info('');
                    }
                    // apply rules
                    const results = rules.flatMap(
                        (rule) =>
                            rule.match({
                                ir,
                                locale: detectedLocale || this.project.getSourceLocale(),
                                file: this.filePath,
                            }) ?? []
                    );
                            
                    const fixable = results.filter((result) => result?.fix !== undefined);

                    let fixer;
                    if (
                        // ensure that autofixing is enabled
                        true === this.project.getConfig().autofix &&
                        // and that any fixable results were produced
                        fixable.length > 0 &&
                        // and that the current parser is able to write
                        parser.canWrite &&
                        // and that the fixer for this type of IR is avaliable
                        (fixer = this.project.getFixerManager().get(ir.getType()))
                    ) {
                        // attempt to apply fixes to the current IR
                        const fixes = /** @type {Fix[]} */ (fixable.map((result) => result.fix));
                        fixer.applyFixes(ir, fixes);

                        // check if anything had been applied
                        if (fixes.some((fix) => fix.applied)) {
                            // fixer should modify the provided IR
                            // so tell current parser to write out the modified representation
                            parser.write(ir);

                            // after writing out the fixed content, we want to reparse to see if any new issues appeared,
                            // while preserving the results that have been fixed so far;
                            // fixer should have set the `applied` flag of each applied Fix
                            // so accumulate the corresponding results
                            fixedResults.push(...results.filter((result) => result.fix?.applied));

                            // indicate that the content has been modified and the re-parsing should occur
                            didWrite = true;

                            // don't process subsequent representations after modifying the file
                            // because they don't match the new file
                            break;
                        }
                    }

                    // otherwise, just accumulate the results of the current parse for each IRs
                    currentParseResults.push(...results);
                }

                // if a write had occurred for a given parser, reparse
            } while (didWrite);

            // once all intermediate representations have been processed for the given parser
            // without any writes, finally return all of the results accumulated during auto-fixing
            // and the remaining ones that were produced
            return [...fixedResults, ...currentParseResults];
        });
    }
}

export default SourceFile;
