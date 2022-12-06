/*
 * SourceFile.js - Represent a source file
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

/**
 * @class Represent a set of i18nlint rules.
 */
class SourceFile {
    /**
     * Construct a source file instance
     * The options parameter can contain any of the following properties:
     *
     * - filePath {String} path to the file
     * - settings {Object} the settings from the i18nlint config that
     *   apply to this file
     * - plugin {Plugin} the plugin that handles this file type
     * - ruleset {RuleSet} the set of rules that applies to this file
     */
    constructor(options) {
        this.filePath = options.filePath;
        this.pattern = options.pattern;
    }

    getFilePath() {
        return this.filePath;
    }

    getLocaleFromPath() {
    }

    parse() {
        const data = fs.readFileSync(this.filePath, "utf-8");
        this.lines = data.split(/\n/g);
        this.type = "line";
    }

    /**
     * Check the current file and return a list of issues found in this file.
     * This method parses the source file and applies each rule in turn
     * using the given locales.
     *
     * @param {RuleSet} rules a set of rules to apply
     * @param {Array.<Locale>} locales a set of locales to apply
     * @returns {Array.<Result>} a list of natch results
     */
    findIssues(rules, locales) {
        let issues = [];
        switch (this.type) {
        case "line":
            for (let i = 0; i < this.lines.length; i++) {
                rules.line.forEach(rule => {
                    locales.forEach(locale => {
                        const result = rule.match({
                            line: this.lines[i],
                            locale,
                            file
                        });
                        issues.push(result);
                    });
                });
            }
            break;
        case "resource":
            const resources = this.ts.getResource();
            resources.forEach(resource => {
                rules.resource.forEach(rule => {
                    options.opt.locales.forEach(locale => {
                        const result = rule.match({
                            locale,
                            resource,
                            file
                        });
                        issues.push(result);
                    });
                });
            });
            break;
        }

        return issues;
    }

    /**
     * @param {String} type
     */
    getRules(type) {
    }
};

export default SourceFile;
