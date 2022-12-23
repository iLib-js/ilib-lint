/*
 * Project.js - Represents a particular i18nlint project
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

import DirItem from './DirItem.js';

const logger = log4js.getLogger("i18nlint.Project");

/**
 * @class Represent an i18nlint project.
 *
 * A project is defined as a root directory and a configuration that
 * goes with it that tells the linter how to process files it finds
 * in that root directory. Subprojects can be nested inside of the
 * the top project as indicated by the presence of a new configuration
 * file in the subdirectory.
 */
class Project extends DirItem {
    /**
     * Construct a new project.
     *
     * @param {String} root root directory for this project
     * @param {Object} options properties controlling how this run of the linter
     * works, mostly from the command-line options
     * @param {Object} config contents of a configuration file for this project
     */
    constructor(root, options, config) {
        super(root, options, config);

        this.files = [];

        if (!options || !root || !config) {
            throw "Insufficient params given to Project constructor";
        }

        this.root = root;
        this.options = options;
        this.config = config;
        if (this.config) {
            this.includes = this.config.paths ? Object.keys(this.config.paths) : ["**"];
            this.excludes = config.excludes;
        }
    }

    getIncludes() {
        return this.includes;
    }

    getExcludes() {
        return this.excludes;
    }

    getOptions() {
        return this.options;
    }

    getLocales() {
        return this.options.locales || this.config.locales;
    }

    getParserManager() {
        const pluginMgr = this.options.pluginManager;
        return pluginMgr.getParserManager();
    }

    getRuleSet(glob) {
        if (this.config.paths && this.config.paths[glob]) {
            const rules = this.config.paths[glob].rules;
        }
    }

    getConfig() {
        return this.config;
    }

    getSettings(glob) {
        return (this.config.paths && this.config.paths[glob]) || {};
    }

    /**
     * Add a directory item to this project.
     *
     * @param {DirItem} item directory item to add
     */
    add(item) {
        this.files.push(item);
    }

    /**
     * Return all directory items in this project.
     * @returns {Array.<DirItem>} the directory items in this project.
     */
    get() {
        return this.files;
    }

    /**
     * Find all issues with the files located within this project and
     * return them.
     *
     * @returns {Array.<Result>} a list of results
     */
    findIssues(ruleset, locales) {
        return this.files.map(file => {
            logger.trace(`Examining ${file.filePath}`);

            file.parse();
            return file.findIssues(ruleset, locales);
        }).flat();
    }

    clear() {
        this.files = [];
    }
};

export default Project;
