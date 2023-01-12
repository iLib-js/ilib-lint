/*
 * FileType.js - Represents a type of file in an i18nlint project
 *
 * Copyright © 2023 JEDLSoft
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

const logger = log4js.getLogger("i18nlint.FileType");

/**
 * @class Represent a type of file in an i18nlint project.
 *
 * Each file is classified into a particular file type. If
 * none of the file type definitions match, then the file will
 * be classified as being in the default "unknown" file type.
 * Files in the unknown file type are usually not processed.
 */
class FileType {
    /**
     * Contructor a new instance of a file type. The options
     * for a file type must contain the following properties:
     *
     * - name - the name or glob spec for this file type
     * - project - the Project that this file type is a part of
     * 
     * Additionally, the options may optionally contain the
     * following properties:
     *
     * - locales (Array of String) - list of locales to use with this file type,
     *   which overrides the global locales for the project
     * - template (String) - the path name template for this file type
     *   which shows how to extract the locale from the path
     *   name if the path includes it. Many file types do not
     *   include the locale in the path, and in those cases,
     *   the template can be left out.
     * - rulesets (Array of String) - a list of rule set names
     *   to use with this file type
     *
     * @param {Object} options the options governing the construction
     * of this file type as documented above
     * @constructor
     */
    constructor(options) {
        if (!options || !options.name || !options.project) {
            throw "Missing required options to the FileType constructor";
        }
        ["name", "project", "locales", "rulesets", "template"].forEach(prop => {
            if (typeof(options[prop]) !== 'undefined') {
                this[prop] = options[prop];
            }
        });
    }

    getName() {
        return this.name;
    }

    getProject() {
        return this.project;
    }

    getLocales() {
        return this.locales || this.project.getLocales();
    }

    getTemplate() {
        return this.template;
    }

    getRuleSetNames() {
        return this.rulesets;
    }

    /**
     * Return a rule set that contains all the rules in all of the rule set
     * definitions.
     *
     * @returns {RuleSet} a ruleset containing all of the rules in all of the
     * definitions
     */
    getRuleSet() {
        const ruleMgr = this.project.getRuleManager();
        const set = new RuleSet();
        this.rulesets.forEach(ruleSetName => {
            const definitions = ruleMgr.getRuleSetDefinition(ruleSetName);
            for (let ruleName in definitions) {
                if (typeof(definitions[ruleName]) === 'boolean') {
                    if (definitions[ruleName]) {
                        set.add(ruleMgr.get(ruleName));
                    } // else turn the rule off by not adding it to the set!
                } else {
                    // only pass in the optional parameter if it is not boolean
                    set.add(ruleMgr.get(ruleName, definitions[ruleName]));
                }
            }
        });
        return set;
    }
}

export default FileType;