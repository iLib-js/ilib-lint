/*
 * RuleFactory.js - Represent a set of ilib-lint rules
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

import { Rule } from 'i18nlint-common';
import log4js from 'log4js';

import ResourceMatcher from './rules/ResourceMatcher.js';
import ResourceSourceChecker from './rules/ResourceSourceChecker.js';
import ResourceTargetChecker from './rules/ResourceTargetChecker.js';
import SourceFileChecker from './rules/SourceFileChecker.js';

import ResourceICUPlurals from './rules/ResourceICUPlurals.js';
import ResourceQuoteStyle from './rules/ResourceQuoteStyle.js';
import ResourceUniqueKeys from './rules/ResourceUniqueKeys.js';

const logger = log4js.getLogger("i18nlint.RuleManager");

const typeMap = {
    "resource-matcher": ResourceMatcher,
    "resource-source": ResourceSourceChecker,
    "resource-target": ResourceTargetChecker,
    "sourcefile": SourceFileChecker
};

/**
 * @class a class to manage all the possible rules
 */
class RuleManager {
    /**
     * Create new Rule manager instance.
     *
     * There are two types of Rules out there: declarative and programmatic.
     * Declarative rules are based on regular expressions and are configured
     * through a simple json file which specifies the regular expressions and
     * some metadata. Programmatic rules are a little more complicated and
     * are declared through plugin code.
     *
     * This factory function can create Rule instances out for any type of
     * rule.
     */
    constructor() {
        this.ruleCache = {};

        // some built-in default rules
        this.addRule(ResourceICUPlurals);
        this.addRule(ResourceQuoteStyle);
        this.addRule(ResourceUniqueKeys);
    }

    /**
     * Return a rule instance for the given name.
     *
     * @param {String} name name of the rule to return
     * @param {Object|undefined} options options for this instance of the
     * rule from the config file, if any
     * @returns {Rule|undefined} an instance of the required rule or undefined if
     * the rule cannot be found
     */
    get(name, options) {
        const ruleConfig = this.ruleCache[name];
        if (!name || !ruleConfig) return;

        if (typeof(ruleConfig) === 'object') {
            const ruleClass = typeMap[ruleConfig.type];
            return new ruleClass({
                ...ruleConfig,
                ...options
            });
        } else {
            return new ruleConfig(options);
        }
    }

    /**
     * @private
     */
    addRule(rule) {
        if (rule) {
            if (typeof(rule) === 'function' && Object.getPrototypeOf(rule).name === "Rule") {
                const p = new rule({});
                this.ruleCache[p.getName()] = rule;
                /*
                for (const extension of p.getExtensions()) {
                    if (!this.ruleCache[extension]) {
                        this.ruleCache[extension] = [];
                    }
                    this.ruleCache[extension].push(rule);
                }
                */
                logger.trace(`Added rule ${p.getName} to the rule manager.`);
            } else if (typeof(rule) === 'object') {
                if (typeof(rule.type) !== 'string' || typeof(rule.name) !== 'string' ||
                    typeof(rule.description) !== 'string' || typeof(rule.note) !== 'string' ||
                    !typeMap[rule.type]) {
                    throw "Insufficient or incorrect arguments to register declarative rule";
                }
                this.ruleCache[rule.name] = rule;
                logger.trace(`Added rule ${rule.name} to the rule manager.`);
            } else {
                logger.debug("Attempt to add a rule that is not declarative nor a class that inherits from Rule");
                throw "Attempt to add a rule that is not declarative nor a class that inherits from Rule";
            }
        } else {
            throw "Cannot add empty rule";
        }
    }

    /**
     * Register a new rule for the rule factory. The rule can be either declarative
     * or programmatic. If the `ruleConfig` parameter is an object, the rule is
     * considered to be declarative. If it is a function, it is considered to be
     * programmatic.
     *
     * A declarative config for a Rule must contain the following properties:
     *
     * - type - the type of the Rule required. This can be one of the declarative
     *   types. The values for declarative types are limited to the following:
     *     - resource-matcher - Checks resources for matches. Any matches for
     *       the given regular expression the source string must also appear
     *       somewhere in the target string.
     *     - resource-source - Check resources for matches of the regular
     *       expression in the source string. Matches in the source string trigger
     *       issues to be generated.
     *     - resource-target - Check resources for matches of the regular
     *       expression in the target string. Matches in the target string trigger
     *       issues to be generated.
     *     - sourcefile - Check source files for matches of the regular
     *       expression. Matches in the source file trigger issues to be generated.
     * - name - the dash-separated unique name of this Rule, such as
     *   "resource-check-plurals"
     * - description - a general description of what this rule is checking for
     * - note - a one-line note that will be printed on screen when the
     *   check fails. Example: "The URL {matchString} did not appear in the
     *   the target." Currently, {matchString} is the only replacement
     *   param that is supported.
     *
     * An attempt to register a declarative rule that does not have all of the above
     * properties will result in an exception being thrown.
     *
     * A programmatic config must be given as a subclass of the Rule class. The
     * class will be queried for its metadata in order to register it properly.
     *
     * Both the declarative and programmatic rules define a unique name, which is
     * what is used to instantiate the rule using the RuleFactory function.
     *
     * @param {Object|Class|Array.<Object|Class>} ruleConfig the configuration for
     * the new rule or rules to register
     * @throws if the required properties are not given in the declarative config
     * or the Class does not inherit from Rule.
     */
    add(rules) {
        if (!rules || (typeof(rules) !== 'object' && typeof(rules) !== 'function')) {
            logger.debug("Attempt to add a rule to the rule manager a rule that is not declarative or is not a class");
        }

        if (Array.isArray(rules)) {
            rules.forEach(rule => {
                this.addRule(rule);
            });
        } else {
            this.addRule(rules);
        }
    };

    /**
     * Return all the rule classes that this manager knows about.
     *
     * @returns {Array.<Rule>} an array of rule classes that this manager
     * knows about
     */
    getRules() {
        return Object.values(this.ruleCache);
    }

    /**
     * Return how many rules this manager knows about.
     * @returns {Number} the number of rules this manager knows about.
     */
    size() {
        return Object.keys(this.ruleCache).length;
    }

    /**
     * for use with the unit tests
     * @private
     */
    clear() {
        this.ruleCache = {};
    }
}

export default RuleManager;