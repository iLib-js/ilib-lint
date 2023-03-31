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

import RuleSet from './RuleSet.js';

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
     * - type (String) - specifies the way that files of this file type
     *   are parsed. This can be one of "resource", "source", "line", or
     *   "ast".
     * - template (String) - the path name template for this file type
     *   which shows how to extract the locale from the path
     *   name if the path includes it. Many file types do not
     *   include the locale in the path, and in those cases,
     *   the template can be left out.
     * - ruleset (Array of String) - a list of rule set names
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
        ["name", "project", "locales", "ruleset", "template", "type"].forEach(prop => {
            if (typeof(options[prop]) !== 'undefined') {
                this[prop] = options[prop];
            }
        });

        this.type = this.type || "source";

        if (this.ruleset) {
            if (typeof(this.ruleset) === 'string') {
                // single string -> convert to an array with a single element
                this.ruleset = [ this.ruleset ];
            } else if (!Array.isArray(this.ruleset)) {
                // rule set definition instead of a ruleset name. Save a new
                // rule set definition in the rule manager and give it a
                // temp name so we can refer to it and make sure that this.ruleset
                // always points to an array of rule set names
                const ruleMgr = this.project.getRuleManager();
                const setName = `${this.name}-unnamed-ruleset`;
                ruleMgr.addRuleSetDefinition(setName, this.ruleset);
                this.ruleset = [ setName ];
            }
        }
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

    getType() {
        return this.type;
    }

    /**
     * Return an array of names of rule sets.
     *
     * @returns {Array.<String>} a list of rule set names
     */
    getRuleSetNames() {
        return this.ruleset;
    }

    /**
     * Return a rule set that contains all the rules in all of the rule set
     * definitions.
     *
     * @returns {Array.<Rule>} a list of rule instances of all the rules in
     * all of the ruleset definitions
     */
    getRules() {
        if (this.rules) return this.rules;
        if (!this.ruleset || this.ruleset.length === 0) return [];

        const ruleMgr = this.project.getRuleManager();
        const set = new RuleSet();
        this.ruleset.forEach(ruleSetName => {
            const definitions = ruleMgr.getRuleSetDefinition(ruleSetName);
            if (!definitions) {
                logger.error(`Could not find rule set ${ruleSetName}`);
                return;
            }
            for (let ruleName in definitions) {
                if (typeof(definitions[ruleName]) === 'boolean') {
                    if (definitions[ruleName]) {
                        set.addRule(ruleMgr.get(ruleName));
                    } // else turn the rule off by not adding it to the set!
                } else {
                    // only pass in the optional parameter if it is not boolean
                    set.addRule(ruleMgr.get(ruleName, definitions[ruleName]));
                }
            }
        });
        // the RuleSet takes care of making sure there are no dups, so now we
        // can just return the list of rule instances. Cache it for subsequent calls.
        this.rules = set.getRules();
        return this.rules;
    }
}

export default FileType;