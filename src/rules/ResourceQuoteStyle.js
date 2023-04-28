/*
 * ResourceQuoteStyle.js - rule to check quotes in the target string
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

import LocaleInfo from 'ilib-localeinfo';
import { Rule, Result } from 'i18nlint-common';

let LICache = {};

// superset of all the non-ASCII start and end chars used in CLDR
const quoteChars = "«»‘“”„「」’‚‹›『』";

/**
 * @class Represent an ilib-lint rule.
 */
class ResourceQuoteStyle extends Rule {
    /**
     * Make a new rule instance.
     * @constructor
     */
    constructor(options) {
        super(options);
        this.name = "resource-quote-style";
        this.description = "Ensure that the proper quote characters are used in translated resources";
        this.sourceLocale = (options && options.sourceLocale) || "en-US";
        if (options && options.param === "localeOnly") {
            // only localized quotes are allowed in the target string
            this.localeOnly = true;
        }
        this.link = "https://github.com/ilib-js/i18nlint/blob/main/docs/resource-quote-style.md";
    }

    getRuleType() {
        return "resource";
    }

    /**
     * @override
     */
    match(options) {
        const { locale, resource, file } = options || {};
        let li = LICache[locale];
        const _this = this;

        if (!li) {
            li = new LocaleInfo(locale);
            LICache[locale] = li;
        }

        let sourceLI = LICache[this.sourceLocale];
        if (!sourceLI) {
            sourceLI = new LocaleInfo(this.sourceLocale);
            LICache[this.sourceLocale] = sourceLI;
        }

        const srcQuoteStart = sourceLI.getDelimiterQuotationStart();
        const srcAltQuoteStart = sourceLI.info.delimiter.alternateQuotationStart;

        const srcQuoteEnd = sourceLI.getDelimiterQuotationEnd();
        const srcAltQuoteEnd = sourceLI.info.delimiter.alternateQuotationEnd;

        const tarQuoteStart = li.getDelimiterQuotationStart();
        const tarAltQuoteStart = li.info.delimiter.alternateQuotationStart;

        const tarQuoteEnd = li.getDelimiterQuotationEnd();
        const tarAltQuoteEnd = li.info.delimiter.alternateQuotationEnd;

        // if the source uses ASCII quotes, then the target could have ASCII or native quotes
        const srcQuotesAscii = new RegExp(`((^|\\W)"\\s?\\p{Letter}|\\p{Letter}\\s?"(\\W|$))`, "gu");
        // leave out the "s" before the final quote to take care of plural possessives (eg. my colleagues' files.)
        const srcQuotesAsciiAlt = new RegExp(`((^|\\W)'\\s?\\p{Letter}|[a-rt-zA-RT-Z]\\s?'(\\W|$))`, "gu");
        const srcQuotesNative = new RegExp(`((^|\\W)${srcQuoteStart}\\s?\\p{Letter}|\\p{Letter}\\s?${srcQuoteEnd}(\\W|$))`, "gu");
        const srcQuotesNativeAlt = new RegExp(`((^|\\W)${srcAltQuoteStart}\\s?\\p{Letter}|\\p{Letter}\\s?${srcAltQuoteEnd}(\\W|$))`, "gu");

        // if the source contains native quotes, then the target should also have native quotes
        const tarQuotesNative = new RegExp(`((^|\\W)${tarQuoteStart}\\s?\\p{Letter}|\\p{Letter}\\s?${tarQuoteEnd}(\\W|$))`, "gu");
        const tarQuotesNativeAlt = new RegExp(`((^|\\W)${tarAltQuoteStart}\\s?\\p{Letter}|\\p{Letter}\\s?${tarAltQuoteEnd}(\\W|$))`, "gu");
        const tarQuotesAll = this.localeOnly ?
            tarQuotesNative :
            new RegExp(`((^|\\W)[${tarQuoteStart}${tarAltQuoteStart}"]\\s?\\p{Letter}|\\p{Letter}\\s?[${tarQuoteEnd}${tarAltQuoteEnd}"](\\W|$))`, "gu");
        const tarQuotesAllAlt = this.localeOnly ?
            tarQuotesNativeAlt :
            new RegExp(`((^|\\W)[${tarAltQuoteStart}']\\s?\\p{Letter}|\\p{Letter}\\s?[${tarAltQuoteEnd}'](\\W|$))`, "gu");

        let nonQuoteChars = quoteChars.
                replace(srcQuoteStart, "").
                replace(tarQuoteStart, "").
                replace(srcQuoteEnd, "").
                replace(tarQuoteEnd, "");
        let nonQuoteCharsAlt = quoteChars.
                replace(srcAltQuoteStart, "").
                replace(tarAltQuoteStart, "").
                replace(srcAltQuoteEnd, "").
                replace(tarAltQuoteEnd, "");

        /**
         * @private
         */
        function checkString(src, tar) {
            srcQuotesAscii.lastIndex = 0;
            srcQuotesAsciiAlt.lastIndex = 0;
            srcQuotesNative.lastIndex = 0;
            srcQuotesNativeAlt.lastIndex = 0;
            tarQuotesAll.lastIndex = 0;
            tarQuotesAllAlt.lastIndex = 0;
            tarQuotesNative.lastIndex = 0;
            tarQuotesNativeAlt.lastIndex = 0;

            const asciiMatches = src.match(srcQuotesAscii);
            const asciiMatchesAlt = src.match(srcQuotesAsciiAlt);
            const nativeMatches = src.match(srcQuotesNative);
            const nativeMatchesAlt = src.match(srcQuotesNativeAlt);

            // see if we need to check the target
            if (!asciiMatches && !asciiMatchesAlt && !nativeMatches && !nativeMatchesAlt) return;

            let re1, re2;
            const quoteStyle = (asciiMatches || nativeMatches) ?
                `${tarQuoteStart}text${tarQuoteEnd}` :
                `${tarAltQuoteStart}text${tarAltQuoteEnd}`;

            if (asciiMatches) {
                if (tar.match(tarQuotesAll)) return;
                re1 = new RegExp(`(^|\\W)([${nonQuoteChars}'])(\\p{Letter})`, "gu");
                re2 = new RegExp(`(\\p{Letter})([${nonQuoteChars}'])(\\W|$)`, "gu");
            } else if (asciiMatchesAlt) {
                if (tar.match(tarQuotesAllAlt)) return;
                re1 = new RegExp(`(^|\\W)[${nonQuoteCharsAlt}"](\\p{Letter})`, "gu");
                re2 = new RegExp(`(\\p{Letter})([${nonQuoteCharsAlt}"])(\\W|$)`, "gu");
            } else if (nativeMatches) {
                if (tar.match(tarQuotesNative)) return;
                re1 = new RegExp(`(^|\\W)([${nonQuoteChars}'"])(\\p{Letter})`, "gu");
                re2 = new RegExp(`(\\p{Letter})([${nonQuoteChars}'"])(\\W|$)`, "gu");
            } else if (nativeMatchesAlt) {
                if (tar.match(tarQuotesNativeAlt)) return;
                re1 = new RegExp(`(^|\\W)([${nonQuoteCharsAlt}'"])(\\p{Letter})`, "gu");
                re2 = new RegExp(`(\\p{Letter})([${nonQuoteCharsAlt}'"])(\\W|$)`, "gu");
            }
            const matches1 = re1 ? re1.exec(tar) : undefined;
            const matches2 = re2 ? re2.exec(tar) : undefined;

            let value = {
                severity: _this.localeOnly ? "error" : "warning",
                id: resource.getKey(),
                source: src,
                rule: _this,
                pathName: file
            };
            if (matches1 || matches2) {
                value.highlight = `Target: ${tar.replace(re1, "$1<e0>$2</e0>$3").replace(re2, "$1<e0>$2</e0>$3")}`;
                value.description = `Quote style for the the locale ${locale} should be ${quoteStyle}`;
            } else {
                value.highlight = `Target: ${tar}<e0></e0>`;
                value.description = `Quotes are missing in the target. Quote style for the the locale ${locale} should be ${tarQuoteStart}text${tarQuoteEnd}`;
            }
            if (typeof(options.lineNumber) !== 'undefined') {
                value.lineNumber = options.lineNumber;
            }
            return new Result(value);
        }

        switch (resource.getType()) {
            case 'string':
                const tarString = resource.getTarget();
                if (tarString) {
                    return checkString(resource.getSource(), tarString);
                }
                break;

            case 'array':
                const srcArray = resource.getSource();
                const tarArray = resource.getTarget();
                if (tarArray) {
                    return srcArray.map((item, i) => {
                        if (i < tarArray.length && tarArray[i]) {
                            return checkString(srcArray[i], tarArray[i]);
                        }
                    }).filter(element => {
                        return element;
                    });
                }
                break;

            case 'plural':
                const srcPlural = resource.getSource();
                const tarPlural = resource.getTarget();
                if (tarPlural) {
                    const hasQuotes = categories.find(category => {
                        return (srcPlural[category] && srcPlural[category].contains(srcQuote));
                    });

                    if (hasQuotes) {
                        return categories.map(category => {
                            return checkString(srcPlural.other, tarPlural[category]);
                        });
                    }
                }
                break;
        }
    }

    // no match
    return;
}

export default ResourceQuoteStyle;