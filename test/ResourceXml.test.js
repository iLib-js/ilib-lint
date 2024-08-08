/*
 * ResourceXML.test.js - test the rule that checks XML matching
 *
 * Copyright © 2024 JEDLSoft
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
import { IntermediateRepresentation, Result, SourceFile } from 'ilib-lint-common';

import ResourceXML from "../src/rules/ResourceXML.js";

const sourceFile = new SourceFile("a/b/c.xliff", {});

describe("testResourceXML", () => {
    test("ResourceXML", () => {
        expect.assertions(1);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();
    });

    test("ResourceXMLName", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        expect(rule.getName()).toBe("resource-xml");
    });

    test("ResourceXMLDescription", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        expect(rule.getDescription()).toBe("Ensure that XML in translated resources match the source");
    });

    test("ResourceXMLSourceLocale", () => {
        expect.assertions(2);

        const rule = new ResourceXML({
            sourceLocale: "de-DE"
        });
        expect(rule).toBeTruthy();

        expect(rule.getSourceLocale()).toBe("de-DE");
    });

    test("ResourceXMLGetRuleType", () => {
        expect.assertions(2);

        const rule = new ResourceXML({
            sourceLocale: "de-DE"
        });
        expect(rule).toBeTruthy();

        expect(rule.getRuleType()).toBe("resource");
    });

    test("ResourceXML match simple no problems", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains <c0>xml tags</c0> in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält <c0>xml</c0>.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(actual).toBeUndefined();
    });

    test("ResourceXML match complicated no problems", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains <c0><b>xml</b> tags</c0> in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält <c0><b>xml</b> Elementer</c0>.",
            pathName: "a/b/c.xliff"
        });
debugger;
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(actual).toBeUndefined();
    });

    test("ResourceXML match no xml", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string does not contains xml tags in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält kein xml.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(actual).toBeUndefined();
    });

    test("ResourceXML match with unclosed HTML tags", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains <p>two paragraphs and a <br>line break in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält <p>zwei Absätze und ein <br> drin.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(actual).toBeUndefined();
    });

    test("ResourceXML does not match with missing unclosed HTML tags", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains <p>two paragraphs in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält nur eine Absätz.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        const expected = new Result({
            severity: "error",
            description: "The number of XML <p> elements in the target (0) does not match the number in the source (1).",
            id: "xml.test",
            source: 'This string contains <p>two paragraphs in it.',
            highlight: 'Target: Diese Zeichenfolge enthält nur eine Absätz.<e0/>',
            rule,
            locale: "de-DE",
            pathName: "a/b/c.xliff"
        });
        expect(actual).toStrictEqual(expected);
    });

    test("ResourceXML not well-formed xml in target, bad tag syntax", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains <p>xml tags</p> in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält <>pxml</>p.",
            pathName: "a/b/c.xliff"
        });
debugger;
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        // if the source contains XML tags, the target must too
        const expected = [
            new Result({
                severity: "error",
                description: "Empty XML elements <> and </> are not allowed in the target.",
                id: "xml.test",
                source: 'This string contains <p>xml tags</p> in it.',
                highlight: 'Target: Diese Zeichenfolge enthält <e0>&lt;></e0>pxml<e0>&lt;/></e0>p.',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "error",
                description: "XML in translation is not well-formed. Error: Unmatched closing tag: p.",
                id: "xml.test",
                source: 'This string contains <p>xml tags</p> in it.',
                highlight: 'Target: Diese Zeichenfolge enthält &lt;>pxml&lt;/>p.<e0/>',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            })
        ];

        expect(actual).toStrictEqual(expected);
    });

    test("ResourceXML not well-formed xml in target, not nested properly", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains <c0><b>xml</b> tags</c0> in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält <c0><b>xml</c0></b>.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });

        // the target should have properly nested xml tags
        const expected = new Result({
            severity: "error",
            description: "XML in translation is not well-formed. Error: Unmatched closing tag: b",
            id: "xml.test",
            source: 'This string contains <c0><b>xml</b> tags</c0> in it.',
            highlight: 'Target: Diese Zeichenfolge enthält &lt;c0>&lt;b>xml&lt;/c0>&lt;/b><e0>.</e0>',
            rule,
            locale: "de-DE",
            pathName: "a/b/c.xliff"
        });
        expect(actual).toStrictEqual(expected);
    });

    test("ResourceXML do not match simple tag", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains <c0>xml tags</c0> in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält <c>xml</c>.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });

        // if the source contains XML tags, the target must too
        const expected = [
            new Result({
                severity: "error",
                description: "The number of XML <c0> elements in the target (0) does not match the number in the source (1).",
                id: "xml.test",
                source: 'This string contains <c0>xml tags</c0> in it.',
                highlight: 'Target: Diese Zeichenfolge enthält <c>xml</c>.<e0/>',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "error",
                description: "The XML element <c> in the target does not appear in the source.",
                id: "xml.test",
                source: 'This string contains <c0>xml tags</c0> in it.',
                highlight: 'Target: Diese Zeichenfolge enthält <e0>&lt;c></e0>xml<e0>&lt;/c></e0>.',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            })
        ];
        expect(actual).toStrictEqual(expected);
    });

    test("ResourceXML match multiple tags, one does not match", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This <b>string</b> contains <c0>xml tags</c0> in it.',
            targetLocale: "de-DE",
            target: "Diese <b>Zeichenfolge</b> enthält <c>xml</c>.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
debugger;
        // if the source contains XML tags, the target must too
        const expected = [
            new Result({
                severity: "error",
                description: "The number of XML <c0> elements in the target (0) does not match the number in the source (1).",
                id: "xml.test",
                source: 'This <b>string</b> contains <c0>xml tags</c0> in it.',
                highlight: 'Target: Diese <b>Zeichenfolge</b> enthält <c>xml</c>.<e0/>',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "error",
                description: "The XML element <c> in the target does not appear in the source.",
                id: "xml.test",
                source: 'This <b>string</b> contains <c0>xml tags</c0> in it.',
                highlight: 'Target: Diese <b>Zeichenfolge</b> enthält <e0>&lt;c></e0>xml<e0>&lt;/c></e0>.',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            })
        ];
        expect(actual).toStrictEqual(expected);
    });

    test("ResourceXML match multiple tags where all do not match", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This <b>string</b> contains <c0>xml tags</c0> in it.',
            targetLocale: "de-DE",
            target: "Diese <x>Zeichenfolge</x> enthält <c>xml</c>.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });

        // if the source contains XML tags, the target must too
        const expected = [
            new Result({
                severity: "error",
                description: "The number of XML <b> elements in the target (0) does not match the number in the source (1).",
                id: "xml.test",
                source: 'This <b>string</b> contains <c0>xml tags</c0> in it.',
                highlight: 'Target: Diese <x>Zeichenfolge</x> enthält <c>xml</c>.<e0/>',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "error",
                description: "The number of XML <c0> elements in the target (0) does not match the number in the source (1).",
                id: "xml.test",
                source: 'This <b>string</b> contains <c0>xml tags</c0> in it.',
                highlight: 'Target: Diese <x>Zeichenfolge</x> enthält <c>xml</c>.<e0/>',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "error",
                description: "The XML element <x> in the target does not appear in the source.",
                id: "xml.test",
                source: 'This <b>string</b> contains <c0>xml tags</c0> in it.',
                highlight: 'Target: Diese <e0>&lt;x></e0>Zeichenfolge<e0>&lt;/x></e0> enthält <c>xml</c>.',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "error",
                description: "The XML element <c> in the target does not appear in the source.",
                id: "xml.test",
                source: 'This <b>string</b> contains <c0>xml tags</c0> in it.',
                highlight: 'Target: Diese <x>Zeichenfolge</x> enthält <e0>&lt;c></e0>xml<e0>&lt;/c></e0>.',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            })
        ];
        expect(actual).toStrictEqual(expected);
    });

    test("ResourceXML match multiple tags, one is missing", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This <b>string</b> contains <c0>xml tags</c0> in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält <c>xml</c>.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });

        // if the source contains XML tags, the target must too
        const expected = [
            new Result({
                severity: "error",
                description: "The number of XML <b> elements in the target (0) does not match the number in the source (1).",
                id: "xml.test",
                source: 'This <b>string</b> contains <c0>xml tags</c0> in it.',
                highlight: 'Target: Diese Zeichenfolge enthält <c>xml</c>.<e0/>',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "error",
                description: "The number of XML <c0> elements in the target (0) does not match the number in the source (1).",
                id: "xml.test",
                source: 'This <b>string</b> contains <c0>xml tags</c0> in it.',
                highlight: 'Target: Diese Zeichenfolge enthält <c>xml</c>.<e0/>',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "error",
                description: "The XML element <c> in the target does not appear in the source.",
                id: "xml.test",
                source: 'This <b>string</b> contains <c0>xml tags</c0> in it.',
                highlight: 'Target: Diese Zeichenfolge enthält <e0>&lt;c></e0>xml<e0>&lt;/c></e0>.',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            })
        ];
        expect(actual).toStrictEqual(expected);
    });

    test("ResourceXML match tags with attributes", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains <a href="url">xml tags</a> in it.',
            targetLocale: "de-DE",
            target: 'Diese Zeichenfolge enthält <a href="url">xml</a>.',
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });

        expect(actual).toBeUndefined();
    });

/*
    test("ResourceXML match tags with attributes that do not match", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains <a href="url">xml tags</a> in it.',
            targetLocale: "de-DE",
            target: 'Diese Zeichenfolge enthält <a>xml</a>c0.',
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });

        // if the source contains XML tags, the target must too
        const expected =
            new Result({
                severity: "error",
                description: "The attributes on the <a> elements in the target do not match the attributes on the same tags in the source.",
                id: "xml.test",
                source: 'This string contains <a href="url">xml tags</a> in it.',
                highlight: 'Target: Diese Zeichenfolge enthält <e0>&lt;a></e0>xml</a>.',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            });
        expect(actual).toStrictEqual(expected);
    });
*/

    test("ResourceXML do not match empty tags", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains <c0>xml tags</c0> in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält <>c0xml</>c0.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });

        // if the source contains XML tags, the target must too
        const expected = [
            new Result({
                severity: "error",
                description: "Empty XML elements <> and </> are not allowed in the target.",
                id: "xml.test",
                source: 'This string contains <c0>xml tags</c0> in it.',
                highlight: 'Target: Diese Zeichenfolge enthält <e0>&lt;></e0>c0xml<e0>&lt;/></e0>c0.',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            }),
            new Result({
                severity: "error",
                description: "XML in translation is not well-formed. Error: Unmatched closing tag: c0.",
                id: "xml.test",
                source: 'This string contains <c0>xml tags</c0> in it.',
                highlight: 'Target: Diese Zeichenfolge enthält &lt;>c0xml&lt;/>c0.<e0/>',
                rule,
                locale: "de-DE",
                pathName: "a/b/c.xliff"
            })
        ];
        expect(actual).toStrictEqual(expected);
    });

/*
    test("ResourceXMLMatchSimpleNativeLocaleOnlyOptions", () => {
        expect.assertions(2);

        const rule = new ResourceXML({
            param: "localeOnly"
        });
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains “quotes” in it.',
            targetLocale: "de-DE",
            target: 'Diese Zeichenfolge enthält "Anführungszeichen".',
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        // if the source contains native quotes, the target must too
        const expected = new Result({
            severity: "error",
            description: "Quote style for the locale de-DE should be „text“",
            id: "xml.test",
            source: 'This string contains “quotes” in it.',
            highlight: 'Target: Diese Zeichenfolge enthält <e0>"</e0>Anführungszeichen<e1>"</e1>.',
            rule,
            locale: "de-DE",
            pathName: "a/b/c.xliff"
        });
        expect(actual).toStrictEqual(expected);
    });

    test("ResourceXMLMatchAsciiToNative", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält „Anführungszeichen“.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        // if the source contains ASCII quotes, the target is allowed to have native quotes
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLMatchAsciiToNativeRussian", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'Click on "My Documents" to see more',
            targetLocale: "ru-RU",
            target: "Click on «Мои документы» to see more",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        // if the source contains ASCII quotes, the target is allowed to have native quotes
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLMatchBeginEndOfWord", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: '"My Documents"',
            targetLocale: "ru-RU",
            target: "«Мои документы»",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        // if the source contains ASCII quotes, the target is allowed to have native quotes
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLMatchAsciiToNativeJapanese", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'Click on "My Documents" to see more',
            targetLocale: "ja-JP",
            target: "「マイドキュメント」をクリックすると詳細が表示されます",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        // if the source contains ASCII quotes, the target is allowed to have native quotes
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLMatchAsciiToNativeJapanese with square brackets", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'Click on "My Documents" to see more',
            targetLocale: "ja-JP",
            target: "[マイドキュメント]をクリックすると詳細が表示されます",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        // if the source contains ASCII quotes, the target is allowed to have square brackets
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLMatchAsciiAlternateToNativeJapanese", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: "Click on 'My Documents' to see more",
            targetLocale: "ja-JP",
            target: "「マイドキュメント」をクリックすると詳細が表示されます",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        // if the source contains alternate ASCII quotes, the target is allowed to have main native quotes
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLMatchAsciiToNativeJapanese with square brackets", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: "Click on 'My Documents' to see more",
            targetLocale: "ja-JP",
            target: "[マイドキュメント]をクリックすると詳細が表示されます",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        // if the source contains alternate ASCII quotes, the target is allowed to have square brackets
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLMatchAltAsciiQuotesMismatch Japanese", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: "Click on 'My Documents' to see more",
            targetLocale: "ja-JP",
            target: "『マイドキュメント』をクリックすると詳細が表示されます",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        // if the source contains alternate quotes, the target should still have main quotes only
        const expected = new Result({
            severity: "warning",
            description: "Quote style for the locale ja-JP should be 「text」",
            id: "xml.test",
            source: "Click on 'My Documents' to see more",
            highlight: "Target: <e0>『</e0>マイドキュメント<e0>』</e0>をクリックすると詳細が表示されます",
            rule,
            locale: "ja-JP",
            pathName: "a/b/c.xliff"
        });
        expect(actual).toStrictEqual(expected);
    });

    test("ResourceXMLMatchAltAsciiQuotesMismatch Japanese with primary quotes", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'Click on "My Documents" to see more',
            targetLocale: "ja-JP",
            target: "『マイドキュメント』をクリックすると詳細が表示されます",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        // if the source contains alternate quotes, the target should still have main quotes only
        const expected = new Result({
            severity: "warning",
            description: "Quote style for the locale ja-JP should be 「text」",
            id: "xml.test",
            source: 'Click on "My Documents" to see more',
            highlight: "Target: <e0>『</e0>マイドキュメント<e0>』</e0>をクリックすると詳細が表示されます",
            rule,
            locale: "ja-JP",
            pathName: "a/b/c.xliff"
        });
        expect(actual).toStrictEqual(expected);
    });

    test("ResourceXMLMatchAsciiQuotes", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "de-DE",
            target: 'Diese Zeichenfolge enthält "Anführungszeichen".',
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLMatchAsciiQuotesMismatch", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält 'Anführungszeichen'.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        // if the source contains ascii quotes, the target should match
        const expected = new Result({
            severity: "warning",
            description: "Quote style for the locale de-DE should be „text“",
            id: "xml.test",
            source: 'This string contains "quotes" in it.',
            highlight: "Target: Diese Zeichenfolge enthält <e0>'</e0>Anführungszeichen<e1>'</e1>.",
            rule,
            locale: "de-DE",
            pathName: "a/b/c.xliff"
        });
        expect(actual).toStrictEqual(expected);
    });

    test("ResourceXMLMatchAsciiQuotesDutch", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "nl-NL",
            target: "Deze string bevat ‘aanhalingstekens’.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLMatchAlternate", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains ‘quotes’ in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält 'Anführungszeichen'.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b"
        });
        const expected = new Result({
            severity: "warning",
            description: "Quote style for the locale de-DE should be ‚text‘",
            id: "xml.test",
            source: "This string contains ‘quotes’ in it.",
            highlight: 'Target: Diese Zeichenfolge enthält <e0>\'</e0>Anführungszeichen<e1>\'</e1>.',
            rule,
            locale: "de-DE",
            pathName: "a/b"
        });

        expect(actual).toStrictEqual(expected);
    });

    test("ResourceXMLMatchAlternate2", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: "Please set your PIN code from 'Menu > PIN Code'.",
            targetLocale: "af-ZA",
            target: 'Stel asseblief u PIN-kode vanaf “Kieslys > PIN-kode”.',
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b"
        });
        const expected = new Result({
            severity: "warning",
            description: "Quote style for the locale af-ZA should be ‘text’",
            id: "xml.test",
            source: "Please set your PIN code from 'Menu > PIN Code'.",
            highlight: "Target: Stel asseblief u PIN-kode vanaf <e0>“</e0>Kieslys > PIN-kode<e1>”</e1>.",
            rule,
            locale: "af-ZA",
            pathName: "a/b"
        });

        expect(actual).toStrictEqual(expected);
    });

    test("ResourceXMLMatchSimpleNoError", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält „Anführungszeichen“.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLMatchNoQuotesNoError", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains quotes in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält Anführungszeichen.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLQuotesAdjacentReplacementParamBracket", () => {
        const rule = new ResourceXML();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: `Showing {maxAmount} entries, "{sourceName}" has more.`,
            targetLocale: "fr-FR",
            target: `Affichant {maxAmount} entrées, « {sourceName} » en contient davantage.`,
            pathName: "a/b/c.xliff"
        });

        const result = rule.matchString({
            source: (resource.getSource()),
            target: (resource.getTarget()),
            resource,
            file: "a/b/c.xliff"
        });

        expect(result).toBeFalsy();
    });

    test("ResourceXMLQuotesAdjacentReplacementParamBracket with fancy quotes in source", () => {
        const rule = new ResourceXML();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: `Showing {maxAmount} entries, “{sourceName}” has more.`,
            targetLocale: "fr-FR",
            target: `Affichant {maxAmount} entrées, « {sourceName} » en contient davantage.`,
            pathName: "a/b/c.xliff"
        });

        const result = rule.matchString({
            source: (resource.getSource()),
            target: (resource.getTarget()),
            resource,
            file: "a/b/c.xliff"
        });

        expect(result).toBeFalsy();
    });

    test("ResourceXMLQuotesAdjacentReplacementParamBracket no quotes in translation", () => {
        const rule = new ResourceXML();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: `Showing {maxAmount} entries, "{sourceName}" has more.`,
            targetLocale: "fr-FR",
            target: `Affichant {maxAmount} entrées, {sourceName} en contient davantage.`,
            pathName: "a/b/c.xliff"
        });

        const result = rule.matchString({
            source: (resource.getSource()),
            target: (resource.getTarget()),
            resource,
            file: "a/b/c.xliff"
        });

        expect(result).toBeTruthy();

        const expected = new Result({
            severity: "warning",
            description: "Quotes are missing in the target. Quote style for the locale fr-FR should be «text»",
            id: "xml.test",
            source: 'Showing {maxAmount} entries, "{sourceName}" has more.',
            highlight: 'Target: Affichant {maxAmount} entrées, {sourceName} en contient davantage.<e0></e0>',
            rule,
            locale: "fr-FR",
            pathName: "a/b/c.xliff"
        });

        expect(result).toStrictEqual(expected);
    });

    test("ResourceXMLQuotesAdjacentReplacementParamBracket fancy quotes in source and no quotes in translation", () => {
        const rule = new ResourceXML();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: `Showing {maxAmount} entries, “{sourceName}” has more.`,
            targetLocale: "fr-FR",
            target: `Affichant {maxAmount} entrées, {sourceName} en contient davantage.`,
            pathName: "a/b/c.xliff"
        });

        const result = rule.matchString({
            source: (resource.getSource()),
            target: (resource.getTarget()),
            resource,
            file: "a/b/c.xliff"
        });

        expect(result).toBeTruthy();

        const expected = new Result({
            severity: "warning",
            description: "Quotes are missing in the target. Quote style for the locale fr-FR should be «text»",
            id: "xml.test",
            source: 'Showing {maxAmount} entries, “{sourceName}” has more.',
            highlight: 'Target: Affichant {maxAmount} entrées, {sourceName} en contient davantage.<e0></e0>',
            rule,
            locale: "fr-FR",
            pathName: "a/b/c.xliff"
        });

        expect(result).toStrictEqual(expected);
    });

    test("ResourceXMLQuotesAdjacentReplacementParamBracket with single quotes in source", () => {
        const rule = new ResourceXML();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: `Showing {maxAmount} entries, '{sourceName}' has more.`,
            targetLocale: "fr-FR",
            target: `Affichant {maxAmount} entrées, « {sourceName} » en contient davantage.`,
            pathName: "a/b/c.xliff"
        });

        const result = rule.matchString({
            source: (resource.getSource()),
            target: (resource.getTarget()),
            resource,
            file: "a/b/c.xliff"
        });

        expect(result).toBeFalsy();
    });

    test("ResourceXMLQuotesAdjacentReplacementParamBracket with single quotes in translation", () => {
        const rule = new ResourceXML();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: `Showing {maxAmount} entries, '{sourceName}' has more.`,
            targetLocale: "fr-FR",
            target: `Affichant {maxAmount} entrées, '{sourceName}' en contient davantage.`,
            pathName: "a/b/c.xliff"
        });

        const result = rule.matchString({
            source: (resource.getSource()),
            target: (resource.getTarget()),
            resource,
            file: "a/b/c.xliff"
        });

        expect(result).toBeFalsy();
    });

    test("ResourceXMLFrenchGuillemets", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "fr-FR",
            target: "Le string contient de «guillemets».",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLFrenchGuillemetsWithSpace", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "fr-FR",
            target: "Le string contient de « guillemets ».",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLFrenchGuillemetsWithNoBreakSpace", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "fr-FR",
            target: "Le string contient de « guillemets ».",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLItalianGuillemets", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "it-IT",
            target: 'Questa stringa contiene «virgolette».',
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLItalianNoGuillemets", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "it-IT",
            target: 'Questa stringa contiene "virgolette".',
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLItalianSkipped", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "it-IT",
            target: "Questa stringa non contiene virgolette.",
            pathName: "a/b/c.xliff"
        });

        const ir = new IntermediateRepresentation({
            type: "resource",
            ir: [resource],
            sourceFile
        });

        const actual = rule.match({
            ir,
            file: "a/b/c.xliff"
        });

        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLMatchQuotesInTargetOnly", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains quotes in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält „Anführungszeichen“.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLMatchAlternateNoError", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains ‘quotes’ in it.',
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält ‚Anführungszeichen‘.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLDontMatchApostrophes", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: "This string doesn't contain quotes in it.",
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält nicht Anführungszeichen.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLDontMatchMultipleApostrophes", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: "This string doesn't contain quotes in it. The user's keyboard is working",
            targetLocale: "de-DE",
            target: "Diese Zeichenfolge enthält nicht Anführungszeichen. Der Tastenbord des Users funktioniert.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLApostropheInTarget", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "fr-FR",
            target: "L'expression contient de «guillemets». C'est tres bizarre !",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLApostropheInTargetSpace", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "fr-FR",
            target: "L'expression contient de « guillemets ». C'est tres bizarre !",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLApostropheInTargetWithNBSpace", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string contains "quotes" in it.',
            targetLocale: "fr-FR",
            target: "L'expression contient de « guillemets ». C'est tres bizarre !",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLQuoteApostropheInTargetNoneInSource", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string does not contain quotes in it.',
            targetLocale: "fr-FR",
            target: "L'expression ne contient pas de guillemets.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLRegularApostropheInTargetNoneInSource", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: 'This string does not contain quotes in it.',
            targetLocale: "fr-FR",
            target: "L’expression ne contient pas de guillemets.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLIgnoreQuoteAsApostropheInSource", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: "This string's contents do not contain quotes in it.",
            targetLocale: "fr-FR",
            target: "L'expression ne contient pas de guillemets.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLIgnoreRegularApostropheInSource", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: "This string’s contents do not contain quotes in it.",
            targetLocale: "fr-FR",
            target: "L'expression ne contient pas de guillemets.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLIgnoreRegularApostropheInTarget", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: "This string’s contents do not contain quotes in it.",
            targetLocale: "fr-FR",
            target: "L’expression ne contient pas de guillemets.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLIgnoreSApostropheInSource", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: "These strings' contents do not contain quotes in it.",
            targetLocale: "fr-FR",
            target: "L'expressions ne contient pas de guillemets.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLIgnoreMissingSwedishQuotes", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const actual = rule.match({
            locale: "sv-SE",
            resource: new ResourceString({
                key: "xml.test",
                sourceLocale: "en-US",
                source: `This is a "string."`,
                targetLocale: "sv-SE",
                target: "Det här är ett snöre.",
                pathName: "a/b/c.xliff"
            }),
            file: "x/y"
        });
        expect(!actual).toBeTruthy();
    });

    test("ResourceXMLSourceOnlyResource", () => {
        expect.assertions(2);

        const rule = new ResourceXML();
        expect(rule).toBeTruthy();

        const resource = new ResourceString({
            key: "xml.test",
            sourceLocale: "en-US",
            source: "These 'strings' contents do not contain quotes in it.",
            pathName: "a/b/c.xliff"
        });
        const actual = rule.matchString({
            source: resource.getSource(),
            target: resource.getTarget(),
            resource,
            file: "a/b/c.xliff"
        });
        expect(!actual).toBeTruthy();
    });
    */
});

