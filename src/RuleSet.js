/*
 * RuleSet.js - Represent a set of i18nlint rules
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

import Rule from './Rule.js';

/**
 * @class Represent a set of i18nlint rules.
 */
class RuleSet {
    /**
     * Construct an i18nlint rule set.
     */
    constructor(rules) {
        this.rules = {};
        this.byname = {};
        if (rules) {
            rules.forEach(rule => {
                this.addRule(rule);
            });
        }
    }

    /**
     * @param {Rule} rule
     */
    addRule(rule) {
        if (!rule || !(rule instanceof Rule)) return;
        const name = rule.getName();
        if (this.byname[name]) return; // already added
        this.byname[name] = rule;
        const type = rule.getRuleType();
        if (!this.rules[type]) {
            this.rules[type] = [rule];
        } else {
            this.rules[type].push(rule);
        }
    }

    /**
     * Return the rule with the given name.
     *
     * @param {String} name name to search for
     * @returns {Rule|undefined} the rule with the given name or
     * undefined if the rule is not known
     */
    getRule(name) {
        return this.byname[name];
    }

    /**
     * Return all the rules of the given type in this set.
     * @param {String} type to search for
     * @returns {Array.<Rule>} the list of rules of the requested type
     */
    getRules(type) {
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
