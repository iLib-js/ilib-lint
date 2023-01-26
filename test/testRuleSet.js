/*
 * testRuleSet.js - test the built-in rules
 *
 * Copyright © 2022-2023 JEDLSoft
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

import ResourceQuoteStyle from '../src/rules/ResourceQuoteStyle.js';
import ResourceICUPlurals from '../src/rules/ResourceICUPlurals.js';
import RuleSet from '../src/RuleSet.js';

export const testRuleSet = {
    testRuleSet: function(test) {
        test.expect(2);

        const ruleset = new RuleSet();
        test.ok(ruleset);
        test.equal(ruleset.getSize(), 0);

        test.done();
    },

    testRuleSetConstructor: function(test) {
        test.expect(2);

        const rule1 = new ResourceQuoteStyle();

        const ruleset = new RuleSet([rule1]);
        test.ok(ruleset);
        test.equal(ruleset.getSize(), 1);

        test.done();
    },

    testRuleSetConstructorMultiple: function(test) {
        test.expect(2);

        const rule1 = new ResourceQuoteStyle();
        const rule2 = new ResourceICUPlurals();

        const ruleset = new RuleSet([rule1, rule2]);
        test.ok(ruleset);
        test.equal(ruleset.getSize(), 2);

        test.done();
    },

    testRuleSetGetByName: function(test) {
        test.expect(4);

        const rule1 = new ResourceQuoteStyle();
        const rule2 = new ResourceICUPlurals();

        const ruleset = new RuleSet([rule1, rule2]);
        test.ok(ruleset);
        test.equal(ruleset.getSize(), 2);

        let rule = ruleset.getRule("resource-quote-style");
        test.equal(rule, rule1);
        rule = ruleset.getRule("resource-icu-plurals");
        test.equal(rule, rule2);

        test.done();
    },

    testRuleSetGetByNameNotExist: function(test) {
        test.expect(3);

        const rule1 = new ResourceQuoteStyle();
        const rule2 = new ResourceICUPlurals();

        const ruleset = new RuleSet([rule1, rule2]);
        test.ok(ruleset);
        test.equal(ruleset.getSize(), 2);

        let rule = ruleset.getRule("asdf");
        test.ok(!rule);

        test.done();
    },

    testRuleSetGetByType: function(test) {
        test.expect(5);

        const rule1 = new ResourceQuoteStyle();
        const rule2 = new ResourceICUPlurals();

        const ruleset = new RuleSet([rule1, rule2]);
        test.ok(ruleset);
        test.equal(ruleset.getSize(), 2);

        const rules = ruleset.getRules("resource");
        test.ok(rules);
        test.equal(rules.length, 2);
        test.equalIgnoringOrder(rules, [rule1, rule2]);

        test.done();
    },

    testRuleSetGetByTypeNonExistant: function(test) {
        test.expect(4);

        const rule1 = new ResourceQuoteStyle();
        const rule2 = new ResourceICUPlurals();

        const ruleset = new RuleSet([rule1, rule2]);
        test.ok(ruleset);
        test.equal(ruleset.getSize(), 2);

        const rules = ruleset.getRules("asdf");
        test.ok(typeof(rules) !== 'undefined');
        test.equal(rules.length, 0);

        test.done();
    },

    testRuleSetAddRuleSize: function(test) {
        test.expect(3);

        const ruleset = new RuleSet();
        test.ok(ruleset);
        test.equal(ruleset.getSize(), 0);

        const rule1 = new ResourceQuoteStyle();

        ruleset.addRule(rule1);
        test.equal(ruleset.getSize(), 1);

        test.done();
    },

    testRuleSetAddRuleContent: function(test) {
        test.expect(2);

        const ruleset = new RuleSet();
        test.ok(ruleset);

        const rule1 = new ResourceQuoteStyle();

        ruleset.addRule(rule1);

        let rule = ruleset.getRule("resource-quote-style");
        test.equal(rule, rule1);

        test.done();
    },

    testRuleSetAddSize: function(test) {
        test.expect(3);

        const ruleset = new RuleSet();
        test.ok(ruleset);
        test.equal(ruleset.getSize(), 0);

        const rule1 = new ResourceQuoteStyle();
        const rule2 = new ResourceICUPlurals();

        ruleset.add([rule1, rule2]);
        test.equal(ruleset.getSize(), 2);

        test.done();
    },

    testRuleSetAddContent: function(test) {
        test.expect(3);

        const ruleset = new RuleSet();
        test.ok(ruleset);

        const rule1 = new ResourceQuoteStyle();
        const rule2 = new ResourceICUPlurals();

        ruleset.add([rule1, rule2]);

        let rule = ruleset.getRule("resource-quote-style");
        test.equal(rule, rule1);
        rule = ruleset.getRule("resource-icu-plurals");
        test.equal(rule, rule2);

        test.done();
    }
};

