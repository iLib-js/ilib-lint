/*
 * DirItem.js - Represents a directory item
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

var logger = log4js.getLogger("i18nlint.Project");

/**
 * @class Represent a directory item.
 *
 * A directory item is the superclass of either a source file or a project.
 * Directories themselves are not represented.
 *
 * @abstract
 */
class DirItem {
    /**
     * Construct a new directory item
     * The options parameter can contain any of the following properties:
     *
     * - filePath {String} path to the file
     * - settings {Object} the settings from the i18nlint config that
     *   apply to this file
     * - pluginManager {PluginManager} the plugin manager for this run of
     *   the i18nlint tool
     */
    constructor(options) {
        if (!options || !options.filePath) {
            throw "Incorrect options given to SourceFile constructor";
        }
        this.filePath = options.filePath;
        this.settings = options.settings;
        this.pluginMgr = options.pluginManager;
    }

    /**
     * Return the file path for this source file.
     *
     * @returns {String} the file path for this source file
     */
    getFilePath() {
        return this.filePath;
    }

    /**
     * Parse the current directory item.
     *
     * @param {Array.<Parser>} parsers parsers for the current source file
     * @returns {Object} the parsed representation of this file
     * @abstract
     */
    parse(parsers) {}

    /**
     * Return the type of this file, resource or line or project.
     * @returns {String} the type of this file
     * @abstract
     */
    getType() {}

    /**
     * Check the directory item and return a list of issues found in it.
     *
     * @param {RuleSet} ruleset a set of rules to apply
     * @param {Array.<Locale>} locales a set of locales to apply
     * @returns {Array.<Result>} a list of natch results
     * @abstract
     */
    findIssues(ruleset, locales) {}
};

export default SourceFile;
