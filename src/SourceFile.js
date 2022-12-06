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
    }

    getFilePath() {
        return this.filePath;
    }

    getLocaleFromPath() {
    }

    parse() {
    }

    /**
     * Return the list of issues found in this file.
     * @returns {Array.<Result>} a list of
     */
    findIssues() {
    }

    /**
     * @param {String} type
     */
    getRules(type) {
    }
};

export default SourceFile;
