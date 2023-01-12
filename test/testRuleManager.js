/*
 * testRuleManager.js - test the rule manager
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
import { Rule } from 'i18nlint-common';

import RuleManager from '../src/RuleManager.js';
import ResourceMatcher from '../src/rules/ResourceMatcher.js';

class MockRule extends Rule {
    constructor(options) {
        super(options);
        this.name = "resource-mock-programmatic";
        this.description = "Mock programmatic rule to test the rule manager";
        if (options && options.style) {
            this.style = options.style;
        }
    }

    getRuleType() {
        return "resource";
    }

    /**
     * @override
     */
    match(options) {
        const { locale, resource, file } = options || {};
        return new Result({
            severity: "warning",
            id: resource.getKey(),
            source: resource.getSource(),
            rule: this,
            pathName: file,
            highlight: `Target: ${tar.replace(/test/g, "<e0>$1</e0>")}`,
            description: `Target should not contain the word "test"`
        });
    }
}

export const testRuleManager = {
    testRuleManagerConstructor: function(test) {
        test.expect(1);

        const mgr = new RuleManager();
        test.ok(mgr);

        test.done();
    },

    testRuleManagerNormal: function(test) {
        test.expect(3);

        const mgr = new RuleManager();
        test.ok(mgr);

        const rule = mgr.get("resource-icu-plurals");

        test.ok(rule);
        test.ok(rule instanceof Rule);

        test.done();
    },

    testRuleManagerNotFound: function(test) {
        test.expect(2);

        const mgr = new RuleManager();
        test.ok(mgr);
        const rule = mgr.get("non-existent");

        test.ok(!rule);

        test.done();
    },

    testRuleManagerAddRuleRightNumbers: function(test) {
        test.expect(3);

        const mgr = new RuleManager();
        test.ok(mgr);

        test.equal(mgr.size(), 3);
        mgr.add(MockRule);
        test.equal(mgr.size(), 4);

        test.done();
    },

    testRuleManagerAddRuleRightTypeProgrammatic: function(test) {
        test.expect(4);

        const mgr = new RuleManager();
        test.ok(mgr);

        test.equal(mgr.size(), 3);
        mgr.add(MockRule);

        const rule = mgr.get("resource-mock-programmatic");

        test.ok(rule);
        test.ok(rule instanceof Rule);

        test.done();
    },

    testRuleManagerAddRuleRightOptionsProgrammatic: function(test) {
        test.expect(4);

        const mgr = new RuleManager();
        test.ok(mgr);

        test.equal(mgr.size(), 3);
        mgr.add(MockRule);

        const rule = mgr.get("resource-mock-programmatic", {
            style: "style2"
        });

        test.ok(rule);
        test.equal(rule.style, "style2");

        test.done();
    },

    testRuleManagerAddRuleRightOptionsProgrammaticMultiple: function(test) {
        test.expect(6);

        const mgr = new RuleManager();
        test.ok(mgr);

        test.equal(mgr.size(), 3);
        mgr.add(MockRule);

        let rule = mgr.get("resource-mock-programmatic", {
            style: "style2"
        });

        test.ok(rule);
        test.equal(rule.style, "style2");

        rule = mgr.get("resource-mock-programmatic", {
            style: "style15"
        });

        test.ok(rule);
        test.equal(rule.style, "style15");

        test.done();
    },

    testRuleManagerAddRuleRightNumbersDeclarative: function(test) {
        test.expect(3);

        const mgr = new RuleManager();
        test.ok(mgr);

        test.equal(mgr.size(), 3);
        mgr.add({
            type: "resource-matcher",
            name: "resource-mock-declarative",
            description: "Mock declarative ruile",
            note: "Word '{matchString}' from the source string does not appear in the target string",
            regexps: [ "test", "foobar" ]
        });
        test.equal(mgr.size(), 4);

        test.done();
    },

    testRuleManagerAddRuleRightTypeDeclarative: function(test) {
        test.expect(4);

        const mgr = new RuleManager();
        test.ok(mgr);

        test.equal(mgr.size(), 3);
        mgr.add({
            type: "resource-matcher",
            name: "resource-mock-declarative",
            description: "Mock declarative ruile",
            note: "Word '{matchString}' from the source string does not appear in the target string",
            regexps: [ "test", "foobar" ]
        });

        const rule = mgr.get("resource-mock-declarative");

        test.ok(rule);
        test.ok(rule instanceof ResourceMatcher);

        test.done();
    },

    testRuleManagerAddRuleRightNumbersMultiple: function(test) {
        test.expect(3);

        const mgr = new RuleManager();
        test.ok(mgr);

        test.equal(mgr.size(), 3);
        mgr.add([
            MockRule,
            {
                type: "resource-matcher",
                name: "resource-mock-declarative",
                description: "Mock declarative ruile",
                note: "Word '{matchString}' from the source string does not appear in the target string",
                regexps: [ "test", "foobar" ]
            }
        ]);
        test.equal(mgr.size(), 5);

        test.done();
    },

    testRuleManagerAddRuleSetDefinitionSize: function(test) {
        test.expect(3);

        const mgr = new RuleManager();
        test.ok(mgr);
        const expected = {
            "resource-mock-programmatic": true,
            "resource-mock-declarative": true
        };
        test.equal(mgr.sizeRuleSetDefinitions(), 0);
        mgr.addRuleSetDefinition("foo", expected);
        test.equal(mgr.sizeRuleSetDefinitions(), 1);

        test.done();
    },

    testRuleManagerAddRuleSetDefinitionContents: function(test) {
        test.expect(2);

        const mgr = new RuleManager();
        test.ok(mgr);
        const expected = {
            "resource-mock-programmatic": true,
            "resource-mock-declarative": true
        };

        mgr.addRuleSetDefinition("foo", expected);

        const rules = mgr.getRuleSetDefinition("foo");
        test.deepEqual(rules, expected);

        test.done();
    },

    testRuleManagerAddRuleSetDefinitionEmptySize: function(test) {
        test.expect(3);

        const mgr = new RuleManager();
        test.ok(mgr);

        test.equal(mgr.sizeRuleSetDefinitions(), 0);
        mgr.addRuleSetDefinition("foo", undefined);
        test.equal(mgr.sizeRuleSetDefinitions(), 0);

        test.done();
    },

    testRuleManagerAddRuleSetDefinitionEmptyContent: function(test) {
        test.expect(2);

        const mgr = new RuleManager();
        test.ok(mgr);

        mgr.addRuleSetDefinition("foo", undefined);
        const rules = mgr.getRuleSetDefinition("foo");
        test.ok(!rules);

        test.done();
    },

    testRuleManagerAddRuleSetDefinitionNonobjectSize: function(test) {
        test.expect(3);

        const mgr = new RuleManager();
        test.ok(mgr);

        test.equal(mgr.sizeRuleSetDefinitions(), 0);
        mgr.addRuleSetDefinition("foo", "asdf");
        test.equal(mgr.sizeRuleSetDefinitions(), 0);

        test.done();
    },

    testRuleManagerAddRuleSetDefinitionNonobjectContent: function(test) {
        test.expect(2);

        const mgr = new RuleManager();
        test.ok(mgr);

        mgr.addRuleSetDefinition("foo", "asdf");
        const rules = mgr.getRuleSetDefinition("foo");
        test.ok(!rules);

        test.done();
    },

    testRuleManagerAddRuleSetDefinitionWithParamsSize: function(test) {
        test.expect(3);

        const mgr = new RuleManager();
        test.ok(mgr);
        const expected = {
            "resource-mock-programmatic": {
                "style": "funky"
            },
            "resource-mock-declarative": true
        };
        test.equal(mgr.sizeRuleSetDefinitions(), 0);
        mgr.addRuleSetDefinition("foo", expected);
        test.equal(mgr.sizeRuleSetDefinitions(), 1);

        test.done();
    },

    testRuleManagerAddRuleSetDefinitionWithParamsContents: function(test) {
        test.expect(2);

        const mgr = new RuleManager();
        test.ok(mgr);
        const expected = {
            "resource-mock-programmatic": {
                "style": "funky"
            },
            "resource-mock-declarative": true
        };
        mgr.addRuleSetDefinition("foo", expected);
        const rules = mgr.getRuleSetDefinition("foo");
        test.deepEqual(rules["resource-mock-programmatic"], {
            "style": "funky"
        });
        test.done();
    },
};

