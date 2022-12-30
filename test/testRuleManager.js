/*
 * testRuleManager.js - test the rule manager
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

import RuleManager from '../src/RuleManager.js';

export const testRuleManager = {
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
    }
};

