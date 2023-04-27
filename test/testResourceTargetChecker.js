/*
 * testResourceTargetChecker.js - test the built-in regular-expression-based rules
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
import { ResourceString, ResourceArray, ResourcePlural } from 'ilib-tools-common';

import ResourceTargetChecker from '../src/rules/ResourceTargetChecker.js';
import { regexRules } from '../src/PluginManager.js';

import { Result } from 'i18nlint-common';

export const testResourceTargetChecker = {
    testResourceNoFullwidthLatin: function(test) {
        test.expect(9);

        const rule = new ResourceTargetChecker(regexRules[2]);
        test.ok(rule);

        const actual = rule.match({
            locale: "ja-JP",
            resource: new ResourceString({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: 'Upload to Box',
                targetLocale: "ja-JP",
                target: "Ｂｏｘにアップロード",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "The full-width characters 'Ｂｏｘ' are not allowed in the target string. Use ASCII letters instead.");
        test.equal(actual[0].highlight, "Target: <e0>Ｂｏｘ</e0>にアップロード");
        test.equal(actual[0].source, 'Upload to Box');
        test.equal(actual[0].pathName, "x/y");

        test.done();
    },

    testResourceNoFullwidthLatinArray: function(test) {
        test.expect(9);

        const rule = new ResourceTargetChecker(regexRules[2]);
        test.ok(rule);

        const actual = rule.match({
            locale: "ja-JP",
            resource: new ResourceArray({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: [
                    'Upload to Box'
                ],
                targetLocale: "ja-JP",
                target: [
                    "Ｂｏｘにアップロード"
                ],
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "The full-width characters 'Ｂｏｘ' are not allowed in the target string. Use ASCII letters instead.");
        test.equal(actual[0].highlight, "Target: <e0>Ｂｏｘ</e0>にアップロード");
        test.equal(actual[0].source, 'Upload to Box');
        test.equal(actual[0].pathName, "x/y");

        test.done();
    },

    testResourceNoFullwidthLatinPlural: function(test) {
        test.expect(9);

        const rule = new ResourceTargetChecker(regexRules[2]);
        test.ok(rule);

        const actual = rule.match({
            locale: "ja-JP",
            resource: new ResourcePlural({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: {
                    one: 'Upload it',
                    other: 'Upload to Box'
                },
                targetLocale: "ja-JP",
                target: {
                    other: "Ｂｏｘにアップロード"
                },
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "The full-width characters 'Ｂｏｘ' are not allowed in the target string. Use ASCII letters instead.");
        test.equal(actual[0].highlight, "Target: <e0>Ｂｏｘ</e0>にアップロード");
        test.equal(actual[0].source, 'Upload to Box');
        test.equal(actual[0].pathName, "x/y");

        test.done();
    },

    testResourceNoFullwidthLatinSuccess: function(test) {
        test.expect(2);

        const rule = new ResourceTargetChecker(regexRules[2]);
        test.ok(rule);

        const actual = rule.match({
            locale: "ja-JP",
            resource: new ResourceString({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: 'Upload to Box',
                targetLocale: "ja-JP",
                target: "Boxにアップロード",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceNoFullwidthLatinSuccessArray: function(test) {
        test.expect(2);

        const rule = new ResourceTargetChecker(regexRules[2]);
        test.ok(rule);

        const actual = rule.match({
            locale: "ja-JP",
            resource: new ResourceArray({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: [
                    'Upload to Box'
                ],
                targetLocale: "ja-JP",
                target: [
                    "Boxにアップロード"
                ],
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceNoFullwidthLatinSuccessPlural: function(test) {
        test.expect(2);

        const rule = new ResourceTargetChecker(regexRules[2]);
        test.ok(rule);

        const actual = rule.match({
            locale: "ja-JP",
            resource: new ResourceArray({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: {
                    one: "Upload it",
                    other: "Upload to Box"
                },
                targetLocale: "ja-JP",
                target: {
                    other: "Boxにアップロード"
                },
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceNoFullwidthLatinMultiple: function(test) {
        test.expect(15);

        const rule = new ResourceTargetChecker(regexRules[2]);
        test.ok(rule);

        const actual = rule.match({
            locale: "ja-JP",
            resource: new ResourceString({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: 'Upload to Box',
                targetLocale: "ja-JP",
                target: "プロＢｏｘにアップロードＢｏｘ",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 2);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "The full-width characters 'Ｂｏｘ' are not allowed in the target string. Use ASCII letters instead.");
        test.equal(actual[0].highlight, "Target: プロ<e0>Ｂｏｘ</e0>にアップロードＢｏｘ");
        test.equal(actual[0].source, 'Upload to Box');
        test.equal(actual[0].pathName, "x/y");

        test.equal(actual[1].severity, "error");
        test.equal(actual[1].id, "matcher.test");
        test.equal(actual[1].description, "The full-width characters 'Ｂｏｘ' are not allowed in the target string. Use ASCII letters instead.");
        test.equal(actual[1].highlight, "Target: プロＢｏｘにアップロード<e0>Ｂｏｘ</e0>");
        test.equal(actual[1].source, 'Upload to Box');
        test.equal(actual[1].pathName, "x/y");

        test.done();
    },

    testResourceNoFullwidthDigits: function(test) {
        test.expect(9);

        const rule = new ResourceTargetChecker(regexRules[3]);
        test.ok(rule);

        const actual = rule.match({
            locale: "ja-JP",
            resource: new ResourceString({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: 'Box12345',
                targetLocale: "ja-JP",
                target: "Box１２３４５",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 1);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "The full-width characters '１２３４５' are not allowed in the target string. Use ASCII digits instead.");
        test.equal(actual[0].highlight, "Target: Box<e0>１２３４５</e0>");
        test.equal(actual[0].source, 'Box12345');
        test.equal(actual[0].pathName, "x/y");

        test.done();
    },

    testResourceNoFullwidthDigitsSuccess: function(test) {
        test.expect(2);

        const rule = new ResourceTargetChecker(regexRules[3]);
        test.ok(rule);

        const actual = rule.match({
            locale: "ja-JP",
            resource: new ResourceString({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: 'Upload to Box',
                targetLocale: "ja-JP",
                target: "Boxにアップロード",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(!actual);

        test.done();
    },

    testResourceNoFullwidthDigitsMultiple: function(test) {
        test.expect(15);

        const rule = new ResourceTargetChecker(regexRules[3]);
        test.ok(rule);

        const actual = rule.match({
            locale: "ja-JP",
            resource: new ResourceString({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: '12345Box12345',
                targetLocale: "ja-JP",
                target: "５４３２１Box１２３４５",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        test.ok(actual);
        test.equal(actual.length, 2);

        test.equal(actual[0].severity, "error");
        test.equal(actual[0].id, "matcher.test");
        test.equal(actual[0].description, "The full-width characters '５４３２１' are not allowed in the target string. Use ASCII digits instead.");
        test.equal(actual[0].highlight, "Target: <e0>５４３２１</e0>Box１２３４５");
        test.equal(actual[0].source, '12345Box12345');
        test.equal(actual[0].pathName, "x/y");

        test.equal(actual[1].severity, "error");
        test.equal(actual[1].id, "matcher.test");
        test.equal(actual[1].description, "The full-width characters '１２３４５' are not allowed in the target string. Use ASCII digits instead.");
        test.equal(actual[1].highlight, "Target: ５４３２１Box<e0>１２３４５</e0>");
        test.equal(actual[1].source, '12345Box12345');
        test.equal(actual[1].pathName, "x/y");

        test.done();
    },

    testResourceNoFullwidthPunctuationSubset: function(test) {
        const illegalPunctuations = ["？", "！", "％"];
        test.expect(1 + illegalPunctuations.length * 8);

        const rule = new ResourceTargetChecker(
            regexRules.find((r) => r.name === "resource-no-fullwidth-punctuation-subset")
        );
        test.ok(rule);

        for (const symbol of illegalPunctuations) {
            const matchSubject = {
                locale: "ja-JP",
                resource: new ResourceString({
                    key: "matcher.test",
                    sourceLocale: "en-US",
                    source: `test${symbol} test`,
                    targetLocale: "ja-JP",
                    target: `テスト${symbol} テスト`,
                    pathName: "a/b/c.xliff",
                }),
                file: "x/y",
            };

            const actual = rule.match(matchSubject);
            test.ok(actual);
            test.equal(actual.length, 1);

            test.equal(actual[0].severity, "error");
            test.equal(
                actual[0].description,
                `The full-width characters '${symbol}' are not allowed in the target string. Use ASCII symbols instead.`
            );
            test.equal(actual[0].highlight, `Target: テスト<e0>${symbol}</e0> テスト`);
            test.equal(actual[0].id, "matcher.test");
            test.equal(actual[0].source, `test${symbol} test`);
            test.equal(actual[0].pathName, "x/y");
        }

        test.done();
    },

    testResourceNoFullwidthPunctuationSubsetSuccess: function(test) {
        test.expect(2);

        const rule = new ResourceTargetChecker(
            regexRules.find((r) => r.name === "resource-no-fullwidth-punctuation-subset")
        );
        test.ok(rule);

        const actual = rule.match({
            locale: "ja-JP",
            resource: new ResourceString({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: "Really? Yes! 100%",
                targetLocale: "ja-JP",
                target: "本当? はい! 100%",
                pathName: "a/b/c.xliff",
            }),
            file: "x/y",
        });
        test.ok(!actual);

        test.done();
    },

    testResourceNoFullwidthPunctuationSubsetMultiple: function(test) {
        test.expect(21);

        const rule = new ResourceTargetChecker(
            regexRules.find((r) => r.name === "resource-no-fullwidth-punctuation-subset")
        );
        test.ok(rule);

        const matchSubject = {
            locale: "ja-JP",
            resource: new ResourceString({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: "Really? Yes! 100%",
                targetLocale: "ja-JP",
                target: "本当？ はい！ 100％",
                pathName: "a/b/c.xliff",
            }),
            file: "x/y",
        };
        const actual = rule.match(matchSubject);
        test.ok(actual);
        test.equal(actual.length, 3);

        for (const a of actual) {
            test.equal(a.severity, "error");
            test.equal(a.id, "matcher.test");
            test.equal(a.source, "Really? Yes! 100%");
            test.equal(a.pathName, "x/y");
        }

        test.equal(
            actual[0].description,
            "The full-width characters '？' are not allowed in the target string. Use ASCII symbols instead."
        );
        test.equal(actual[0].highlight, "Target: 本当<e0>？</e0> はい！ 100％");

        test.equal(
            actual[1].description,
            "The full-width characters '！' are not allowed in the target string. Use ASCII symbols instead."
        );
        test.equal(actual[1].highlight, "Target: 本当？ はい<e0>！</e0> 100％");

        test.equal(
            actual[2].description,
            "The full-width characters '％' are not allowed in the target string. Use ASCII symbols instead."
        );
        test.equal(actual[2].highlight, "Target: 本当？ はい！ 100<e0>％</e0>");

        test.done();
    },

    testResourceNoHalfWidthKana: function(test) {
        test.expect(2);

        const rule = new ResourceTargetChecker(
            regexRules.find((r) => r.name === "resource-no-halfwidth-kana-characters")
        );
        test.ok(rule);

        const subject = {
            locale: "ja-JP",
            resource: new ResourceString({
                key: "matcher.test",
                sourceLocale: "en-US",
                source: "Communication",
                targetLocale: "ja-JP",
                target: "ｺﾐｭﾆｹｰｼｮﾝ",
                pathName: "a/b/c.xliff",
            }),
            file: "x/y",
        };

        const result = rule.match(subject);
        test.deepEqual(result, [new Result({
            rule,
            severity: "warning",
            locale: "ja-JP",
            pathName: "x/y",
            source: "Communication",
            id: "matcher.test",
            description: "The half-width kana characters are not allowed in the target string. Use full-width characters.",
            highlight: "Target: <e0>ｺﾐｭﾆｹｰｼｮﾝ</e0>",
        })]);

        test.done();
    },

    testResourceNoDoubleByteSpace: function(test) {
        const illegalCharacters = [
            "\u1680",
            "\u2000",
            "\u2001",
            "\u2002",
            "\u2003",
            "\u2004",
            "\u2005",
            "\u2006",
            "\u2007",
            "\u2008",
            "\u2009",
            "\u200A",
            "\u2028",
            "\u2029",
            "\u202F",
            "\u205F",
            "\u3000",
        ];
        test.expect(1 + illegalCharacters.length);

        const rule = new ResourceTargetChecker(
            regexRules.find((r) => r.name === "resource-no-double-byte-space")
        );
        test.ok(rule);

        for (const symbol of illegalCharacters) {
            const subject = {
                locale: "ja-JP",
                resource: new ResourceString({
                    key: "matcher.test",
                    sourceLocale: "en-US",
                    source: `test${symbol}test`,
                    targetLocale: "ja-JP",
                    target: `テスト${symbol}テスト`,
                    pathName: "a/b/c.xliff",
                }),
                file: "x/y",
            };

            const result = rule.match(subject);
            test.deepEqual(result, [new Result({
                rule,
                severity: "warning",
                pathName: "x/y",
                locale: "ja-JP",
                source: `test${symbol}test`,
                id: "matcher.test",
                description: "Double-byte space characters should not be used in the target string. Use ASCII symbols instead.",
                highlight: `Target: テスト<e0>${symbol}</e0>テスト`,
            })]);
        }

        test.done();
    },

    testResourceNoSpaceWithFullwidthPunctSpaceAfter: function(test) {
        const applicableCharacters = [
            "、",
            "。",
            "〈", 
            "〉",
            "《",
            "》",
            "「",
            "」",
            "『",
            "』",
            "【",
            "】",
            "〔",
            "〕",
            "〖",
            "〗",
            "〘",
            "〙",
            "〚",
            "〛",
        ];
        test.expect(1 + applicableCharacters.length);

        const rule = new ResourceTargetChecker(
            regexRules.find((r) => r.name === "resource-no-space-with-fullwidth-punctuation")
        );
        test.ok(rule);

        for (const symbol of applicableCharacters) {
            const illegalSequence = symbol + " ";
            const subject = {
                locale: "ja-JP",
                resource: new ResourceString({
                    key: "matcher.test",
                    sourceLocale: "en-US",
                    source: `test${illegalSequence}test`,
                    targetLocale: "ja-JP",
                    target: `テスト${illegalSequence}テスト`,
                    pathName: "a/b/c.xliff",
                }),
                file: "x/y",
            };

            const result = rule.match(subject);
            test.deepEqual(result, [new Result({
                rule,
                severity: "warning",
                pathName: "x/y",
                locale: "ja-JP",
                source: `test${illegalSequence}test`,
                id: "matcher.test",
                description: `There should be no space adjacent to fullwidth punctuation characters '${illegalSequence}'. Remove it.`,
                highlight: `Target: テスト<e0>${illegalSequence}</e0>テスト`,
            })]);
        }

        test.done();
    },

    testResourceNoSpaceWithFullwidthPunctSpaceBefore: function(test) {
        const applicableCharacters = [
            "、",
            "。",
            "〈", 
            "〉",
            "《",
            "》",
            "「",
            "」",
            "『",
            "』",
            "【",
            "】",
            "〔",
            "〕",
            "〖",
            "〗",
            "〘",
            "〙",
            "〚",
            "〛",
        ];
        test.expect(1 + applicableCharacters.length);

        const rule = new ResourceTargetChecker(
            regexRules.find((r) => r.name === "resource-no-space-with-fullwidth-punctuation")
        );
        test.ok(rule);

        for (const symbol of applicableCharacters) {
            const illegalSequence = " " + symbol;
            const subject = {
                locale: "ja-JP",
                resource: new ResourceString({
                    key: "matcher.test",
                    sourceLocale: "en-US",
                    source: `test${illegalSequence}test`,
                    targetLocale: "ja-JP",
                    target: `テスト${illegalSequence}テスト`,
                    pathName: "a/b/c.xliff",
                }),
                file: "x/y",
            };

            const result = rule.match(subject);
            test.deepEqual(result, [new Result({
                rule,
                severity: "warning",
                pathName: "x/y",
                locale: "ja-JP",
                source: `test${illegalSequence}test`,
                id: "matcher.test",
                description: `There should be no space adjacent to fullwidth punctuation characters '${illegalSequence}'. Remove it.`,
                highlight: `Target: テスト<e0>${illegalSequence}</e0>テスト`,
            })]);
        }

        test.done();
    },
};
