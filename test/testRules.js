/*
 * testRules.js - test the built-in rules
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

import ResourceQuoteStyle from '../src/rules/ResourceQuoteStyle.js';

export const testwalk = {
    testResourceQuoteStyle: function(test) {
        test.expect(1);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);
        
        test.done();
    },
    
    testResourceQuoteStyleName: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);
        
        test.equal(rule.getName(), "resources-quote-style");

        test.done();
    },
    
    testResourceQuoteStyleDescription: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);
        
        test.equal(rule.getDescription(), "Ensure that the proper quote characters are used in translated resources");

        test.done();
    },
    
    testResourceQuoteStyleSourceLocale: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle({
            sourceLocale: "de-DE"
        });
        test.ok(rule);
        
        test.equal(rule.getSourceLocale(), "de-DE");

        test.done();
    },
    
    testResourceQuoteStyleGetRuleType: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle({
            sourceLocale: "de-DE"
        });
        test.ok(rule);
        
        test.equal(rule.getRuleType(), "resource");

        test.done();
    },
    
    testResourceQuoteStyleMatchSimple: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "de-DE",
            resource: {}
        });
        const expected = {
            severity: "warning",
            description: "quote style for the the locale de-DE should be „text“",
            highlight: "Source: \nTarget: "
        };
        test.deepEqual(actual, expected);

        test.done();
    }
};

    