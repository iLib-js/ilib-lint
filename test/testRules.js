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
import { ResourceString } from 'ilib-tools-common';

import ResourceQuoteStyle from '../src/rules/ResourceQuoteStyle.js';
import ResourceICUPlurals from '../src/rules/ResourceICUPlurals.js';

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
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains “quotes” in it.',
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält 'Anführungszeichen'."
            })
        });
        const expected = {
            severity: "warning",
            description: "quote style for the the locale de-DE should be „text“",
            id: "quote.test",
            highlight: 'Source: This string contains “quotes” in it.\nTarget: Diese Zeichenfolge enthält <e0>\'</e0>Anführungszeichen<e0>\'</e0>.'
        };
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceQuoteStyleMatchSimpleAsciiQuotes: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains "quotes" in it.',
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält 'Anführungszeichen'."
            })
        });
        const expected = {
            severity: "warning",
            description: "quote style for the the locale de-DE should be „text“",
            id: "quote.test",
            highlight: 'Source: This string contains "quotes" in it.\nTarget: Diese Zeichenfolge enthält <e0>\'</e0>Anführungszeichen<e0>\'</e0>.'
        };
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceQuoteStyleMatchAlternate: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains ‘quotes’ in it.',
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält 'Anführungszeichen'."
            })
        });
        const expected = {
            severity: "warning",
            description: "quote style for the the locale de-DE should be „text“",
            id: "quote.test",
            highlight: 'Source: This string contains ‘quotes’ in it.\nTarget: Diese Zeichenfolge enthält <e0>\'</e0>Anführungszeichen<e0>\'</e0>.'
        };
        test.deepEqual(actual, expected);

        test.done();
    },
    
    testResourceQuoteStyleMatchSimpleNoError: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains "quotes" in it.',
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält „Anführungszeichen“."
            })
        });
        test.ok(!actual);

        test.done();
    },
        
    testResourceQuoteStyleMatchSimpleNoQuotesNoError: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains quotes in it.',
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält Anführungszeichen."
            })
        });
        test.ok(!actual);

        test.done();
    },
    
    testResourceQuoteStyleMatchSimpleQuotesInTargetOnly: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains quotes in it.',
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält „Anführungszeichen“."
            })
        });
        test.ok(!actual);

        test.done();
    },
    
    testResourceQuoteStyleMatchAlternateNoError: function(test) {
        test.expect(2);

        const rule = new ResourceQuoteStyle();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "quote.test",
                sourceLocale: "en-US",
                source: 'This string contains ‘quotes’ in it.',
                targetLocale: "de-DE",
                target: "Diese Zeichenfolge enthält ‚Anführungszeichen‘."
            })
        });
        test.ok(!actual);

        test.done();
    },
    
    testResourceICUPluralsMatchNoError: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}}"
            })
        });
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralsMatchNestedNoError: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {{total, plural, one {There is {count} of {total} item available} other {There is {count} of {total} items available}}} other {{total, plural, one {There are {count} of {total} item available} other {There are {count} of {total} items available}}}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {{total, plural, one {Es gibt {count} von {total} Arkitel verfügbar} other {Es gibt {count} von {total} Arkitel verfügbar}}} other {{total, plural, one {Es gibt {count} von {total} Arkitel verfügbar} other {Es gibt {count} von {total} Arkitel verfügbar}}}}"
            })
        });
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralsMatchNestedMultiLineNoError: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: `{count, plural, 
                    one {
                        {total, plural, 
                            one {There is {count} of {total} item available} 
                            other {There is {count} of {total} items available}
                        }
                    }
                    other {
                        {total, plural, 
                            one {There are {count} of {total} item available} 
                            other {There are {count} of {total} items available}
                        }
                    }
                }`,
                targetLocale: "de-DE",
                target: `{count, plural, 
                    one {
                        {total, plural,
                            one {Es gibt {count} von {total} Arkitel verfügbar}
                            other {Es gibt {count} von {total} Arkitel verfügbar}
                        }
                    }
                    other {
                        {total, plural,
                            one {Es gibt {count} von {total} Arkitel verfügbar}
                            other {Es gibt {count} von {total} Arkitel verfügbar}
                        }
                    }
                }`
            })
        });
        test.ok(!actual);

        test.done();
    },

    testResourceICUPluralsMatchSimpleTooManyOpenBraces: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {{Dies ist einzigartig} other {Dies ist mehrerartig}}"
            })
        });
        const expected = {
            severity: "error",
            description: "Incorrect plural or select syntax in target string: SyntaxError: MALFORMED_ARGUMENT",
            id: "plural.test",
            highlight: 'Source: {count, plural, one {This is singular} other {This is plural}}\nTarget: {count, plural, one {{Dies <e0>ist einzigartig} other {Dies ist mehrerartig}}</e0>'
        };
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchSimpleUnclosedOpenBraces: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}"
            })
        });
        const expected = {
            severity: "error",
            description: "Incorrect plural or select syntax in target string: SyntaxError: EXPECT_ARGUMENT_CLOSING_BRACE",
            id: "plural.test",
            highlight: 'Source: {count, plural, one {This is singular} other {This is plural}}\nTarget: {count, plural, one {Dies ist einzigartig} other {Dies ist mehrerartig}<e0></e0>'
        };
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchSimpleTranslatedCategories: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "de-DE",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, eins {Dies ist einzigartig} andere {Dies ist mehrerartig}}"
            })
        });
        const expected = {
            severity: "error",
            description: "Incorrect plural or select syntax in target string: SyntaxError: MISSING_OTHER_CLAUSE",
            id: "plural.test",
            highlight: 'Source: {count, plural, one {This is singular} other {This is plural}}\nTarget: {count, plural, eins {Dies ist einzigartig} andere {Dies ist mehrerartig}<e0>}</e0>'
        };
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchSimpleMissingCategories: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "ru-RU",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, one {This is singular} other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Это единственное число} other {это множественное число}}"
            })
        });
        const expected = {
            severity: "error",
            description: "Missing plural categories in target string: few. Expecting all of these: one, few, other",
            id: "plural.test",
            highlight: 'Target: {count, plural, one {Это единственное число} other {это множественное число}}<e0></e0>'
        };
        test.deepEqual(actual, expected);

        test.done();
    },
    
    testResourceICUPluralsMatchSimpleMissingCategoriesInSource: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "ru-RU",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: '{count, plural, other {This is plural}}',
                targetLocale: "de-DE",
                target: "{count, plural, one {Это единственное число} few {это множественное число} other {это множественное число}}"
            })
        });
        const expected = {
            severity: "error",
            description: "Missing plural categories in source string: one. Expecting all of these: one, other",
            id: "plural.test",
            highlight: 'Source: {count, plural, other {This is plural}}<e0></e0>'
        };
        test.deepEqual(actual, expected);

        test.done();
    },
    
    testResourceICUPluralsMatchSimpleMissingCategoriesNested: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "ru-RU",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: `{count, plural, 
                    one {
                        {total, plural, 
                            one {There is {count} of {total} item available} 
                            other {There is {count} of {total} items available}
                        }
                    }
                    other {
                        {total, plural, 
                            one {There are {count} of {total} item available} 
                            other {There are {count} of {total} items available}
                        }
                    }
                }`,
                targetLocale: "ru-RU",
                target: `{count, plural, 
                    one {
                        {total, plural,
                            one {Есть {count} из {total} статьи}
                            few {Есть {count} из {total} статей}
                            other {Есть {count} из {total} статей}
                        }
                    }
                    few {
                        {total, plural,
                            one {Есть {count} из {total} статьи}
                            other {Есть {count} из {total} статей}
                        }
                    }
                    other {
                        {total, plural,
                            one {Есть {count} из {total} статьи}
                            few {Есть {count} из {total} статей}
                            other {Есть {count} из {total} статей}
                        }
                    }
                }`
            })
        });
        const expected = {
            severity: "error",
            description: "Missing plural categories in target string: few. Expecting all of these: one, few, other",
            id: "plural.test",
            highlight: 'Target: {count, plural, \n' +
                '                    one {\n' +
                '                        {total, plural,\n' +
                '                            one {Есть {count} из {total} статьи}\n' +
                '                            few {Есть {count} из {total} статей}\n' +
                '                            other {Есть {count} из {total} статей}\n' +
                '                        }\n' +
                '                    }\n' +
                '                    few {\n' +
                '                        {total, plural,\n' +
                '                            one {Есть {count} из {total} статьи}\n' +
                '                            other {Есть {count} из {total} статей}\n' +
                '                        }\n' +
                '                    }\n' +
                '                    other {\n' +
                '                        {total, plural,\n' +
                '                            one {Есть {count} из {total} статьи}\n' +
                '                            few {Есть {count} из {total} статей}\n' +
                '                            other {Есть {count} из {total} статей}\n' +
                '                        }\n' +
                '                    }\n' +
                '                }<e0></e0>'
        };
        test.deepEqual(actual, expected);

        test.done();
    },

    testResourceICUPluralsMatchSimpleMultipleMissingCategoriesNested: function(test) {
        test.expect(2);

        const rule = new ResourceICUPlurals();
        test.ok(rule);
        
        const actual = rule.match({
            locale: "ru-RU",
            resource: new ResourceString({
                key: "plural.test",
                sourceLocale: "en-US",
                source: `{count, plural, 
                    one {
                        {total, plural, 
                            one {There is {count} of {total} item available} 
                            other {There is {count} of {total} items available}
                        }
                    }
                    other {
                        {total, plural, 
                            one {There are {count} of {total} item available} 
                            other {There are {count} of {total} items available}
                        }
                    }
                }`,
                targetLocale: "ru-RU",
                target: `{count, plural, 
                    one {
                        {total, plural,
                            one {Есть {count} из {total} статьи}
                            few {Есть {count} из {total} статей}
                            other {Есть {count} из {total} статей}
                        }
                    }
                    few {
                        {total, plural,
                            one {Есть {count} из {total} статьи}
                            other {Есть {count} из {total} статей}
                        }
                    }
                    other {
                        {total, plural,
                            one {Есть {count} из {total} статьи}
                            other {Есть {count} из {total} статей}
                        }
                    }
                }`
            })
        });
        const expected = [ 
            {
                severity: "error",
                description: "Missing plural categories in target string: few. Expecting all of these: one, few, other",
                id: "plural.test",
                highlight: 'Target: {count, plural, \n' +
                    '                    one {\n' +
                    '                        {total, plural,\n' +
                    '                            one {Есть {count} из {total} статьи}\n' +
                    '                            few {Есть {count} из {total} статей}\n' +
                    '                            other {Есть {count} из {total} статей}\n' +
                    '                        }\n' +
                    '                    }\n' +
                    '                    few {\n' +
                    '                        {total, plural,\n' +
                    '                            one {Есть {count} из {total} статьи}\n' +
                    '                            other {Есть {count} из {total} статей}\n' +
                    '                        }\n' +
                    '                    }\n' +
                    '                    other {\n' +
                    '                        {total, plural,\n' +
                    '                            one {Есть {count} из {total} статьи}\n' +
                    '                            other {Есть {count} из {total} статей}\n' +
                    '                        }\n' +
                    '                    }\n' +
                    '                }<e0></e0>'
            },
            {
                severity: "error",
                description: "Missing plural categories in target string: few. Expecting all of these: one, few, other",
                id: "plural.test",
                highlight: 'Target: {count, plural, \n' +
                    '                    one {\n' +
                    '                        {total, plural,\n' +
                    '                            one {Есть {count} из {total} статьи}\n' +
                    '                            few {Есть {count} из {total} статей}\n' +
                    '                            other {Есть {count} из {total} статей}\n' +
                    '                        }\n' +
                    '                    }\n' +
                    '                    few {\n' +
                    '                        {total, plural,\n' +
                    '                            one {Есть {count} из {total} статьи}\n' +
                    '                            other {Есть {count} из {total} статей}\n' +
                    '                        }\n' +
                    '                    }\n' +
                    '                    other {\n' +
                    '                        {total, plural,\n' +
                    '                            one {Есть {count} из {total} статьи}\n' +
                    '                            other {Есть {count} из {total} статей}\n' +
                    '                        }\n' +
                    '                    }\n' +
                    '                }<e0></e0>'
            },
        ]
        test.deepEqual(actual, expected);

        test.done();
    },
};

    