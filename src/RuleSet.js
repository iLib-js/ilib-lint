/*
 * RuleSet.js - Represent a set of ilib-lint rule instances
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
 * @class Represent a set of ilib-lint rules. The rule manager keeps
 * track of all the rules that are known to in this run of the linter,
 * and a RuleSet is a named set of rule names and options of some or all of
 * those rules.
 */
class RuleSet {
    /**
     * Construct an ilib-lint rule set.
     */
    constructor(name, rules) {
        this.name = name;
        this.rules = {};
        if (rules) {
            this.add(rules);
        }
    }

    getName() {
        return this.name;
    }

    /**
     * Add rules and their optional parameters to this rule set.
     * @param {Object} rules the rule definitions to add
     */
    add(rules) {
        if (!rules || typeof(rules) !== 'object') return;
        for (let rule in rules) {
            // a boolean value of "false" will turn off the rule
            // in this set if it was previously defined
            this.rules[rule] =
                (typeof(this.rules[rule]) !== 'undefined' &&
                 typeof(rules[rule]) === 'boolean' &&
                 !rules[rule]) ? undefined : rules[rule];
        }
    }

    /**
     * Return an object containing the names of all the rules
     * and mapping them to optional parameters, or to the boolean
     * value of true.
     *
     * @returns {Object} the set of rules and optional parameters
     */
    getRules() {
        return this.rules;
    }

    /**
     * Return the number of rules in this set.
     * @returns {Number} the number of rules in this set
     */
    getSize() {
        return Object.keys(this.rules).length;
    }
};

export default RuleSet;
