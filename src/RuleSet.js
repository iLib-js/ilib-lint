/*
 * RuleSet.js - Represent a set of ilib-lint rules
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

import ResourceRegExpChecker from './rules/ResourceRegExpChecker.js';

/**
 * @class Represent a set of ilib-lint rules.
 */
class RuleSet {
    /**
     * Construct an ilib-lint rule set.
     */
    constructor(rules) {
        this.rules = {};
        this.byname = {};
        if (rules) {
            this.add(rules);
        }
    }

    /**
     * Add a rule to this set.
     *
     * @param {Rule} rule the rule to add
     */
    addRule(rule) {
        if (!rule) return;
        let name, type;
        if (typeof(rule) === 'function' && Object.getPrototypeOf(rule).name === "Rule") {
            const r = new rule();
            name = r.getName();
            type = r.getRuleType();
        } else if (typeof(rule) === 'object') {
            name = rule.name;
            type = "resource";
        }

        if (this.byname[name]) return; // already added
        this.byname[name] = rule;
        if (!this.rules.resource) {
            this.rules.resource = [];
        }
        this.rules.resource.push(name);
    }

    /**
     * Add an array of rules.
     *
     * @param {Array.<Rule>} rules an array to add to this set
     */
    add(rules) {
        rules.forEach(rule => this.addRule(rule));
    }

    /**
     * Return the rule with the given name.
     *
     * @param {String} name name to search for
     * @param {Object} options options for this instance of the rule
     * @returns {Rule|undefined} the rule with the given name or
     * undefined if the rule is not known
     */
    getRule(name, options) {
        const rule = this.byname[name];
        if (typeof(rule) === 'object') {
            return new ResourceRegExpChecker({
                ...rule,
                ...options
            });
        }
        return rule ? new rule(options) : undefined;
    }

    /**
     * Return the names of all the rules of the given type in this
     * set.
     *
     * @param {String} type to search for
     * @returns {Array.<String>} the list of rule names of
     * the requested type
     */
    getRules(type, options) {
        return this.rules[type] || [];
    }

    /**
     * Return the number of rules in this set.
     * @returns {Number} the number of rules in this set
     */
    getSize() {
        return Object.keys(this.byname).length;
    }
};

export default RuleSet;
