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

var logger = log4js.getLogger("i18nlint.Project");

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
     * The options parameter may contain any of the following properties
     *
     * - root (String) - root directory for this project
     * - config (Object) - a configuration for this project
     * - pluginManager (PluginManager) - the plugin manager to use with
     *   this project
     *
     * @param {Object} options properties controlling how this project
     * works (see above)
     */
    constructor(options) {
        super(options);

        this.files = [];

        if (!options || !options.root || !options.config) {
            throw "Insufficient options given to Project constructor";
        }

        this.root = options.root;
        this.config = options.config
    }

    findIssues(ruleset, locales) {
        return this.files.map(file => {
            logger.trace(`Examining ${file.filePath}`);

            if (file.getType() === "project") {
                return file.findIssues(ruleset, locales);
            }

            let parserClasses;
            let extension = path.extname(file.getFilePath());
            if (extension) {
                // remove the dot
                extension = extension.substring(1);
                const pm = this.pluginMgr.getParserManager();
                parserClasses = pm.get(extension);
            }

            file.parse(parserClasses);
            return file.findIssues(ruleset, options.opt.locales);
        }).flat();
    }
};

export default Project;
