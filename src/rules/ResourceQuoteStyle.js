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

// superset of all the start and end chars used in CLDR
const quoteChars = "«»‘“”„「」’‚‹›『』\"\'";

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
        const srcQuotesAscii = new RegExp(`((^|\\W)['"]\\p{Letter}|\\p{Letter}['"](\\W|$))`, "gu");
        const srcQuotesNative = new RegExp(`((^|\\W)[${srcQuoteStart}${srcAltQuoteStart}]\\p{Letter}|\\p{Letter}[${srcQuoteEnd}${srcAltQuoteEnd}](\\W|$))`, "gu");

        // if the source contains native quotes, then the target should also have native quotes
        const tarQuotesNative = new RegExp(`((^|\\W)[${tarQuoteStart}${tarAltQuoteStart}]\\p{Letter}|\\p{Letter}[${tarQuoteEnd}${tarAltQuoteEnd}](\\W|$))`, "gu");
        const tarQuotesAll = this.localeOnly ?
            tarQuotesNative :
            new RegExp(`((^|\\W)[${tarQuoteStart}${tarAltQuoteStart}'"]\\p{Letter}|\\p{Letter}[${tarQuoteEnd}${tarAltQuoteEnd}'"](\\W|$))`, "gu");

        const nonQuoteChars = `([${
            quoteChars.
                replace(srcQuoteStart, "").
                replace(srcAltQuoteStart, "").
                replace(tarQuoteStart, "").
                replace(tarAltQuoteStart, "").
                replace(srcQuoteEnd, "").
                replace(srcAltQuoteEnd, "").
                replace(tarQuoteEnd, "").
                replace(tarAltQuoteEnd, "")}])`;
        const re = new RegExp(nonQuoteChars, "g");

        /**
         * @private
         */
        function checkString(src, tar) {
            srcQuotesAscii.lastIndex = 0;
            tarQuotesAll.lastIndex = 0;
            if ((src.match(srcQuotesAscii) && !tar.match(tarQuotesAll)) ||
                (src.match(srcQuotesNative) && !tar.match(tarQuotesNative))) {
                const matches = re.exec(tar);
                let value = {
                    severity: _this.localeOnly ? "error" : "warning",
                    id: resource.getKey(),
                    source: src,
                    rule: _this,
                    pathName: file
                };
                if (matches) {
                    value.highlight = `Target: ${tar.replace(re, "<e0>$1</e0>")}`;
                    value.description = `Quote style for the the locale ${locale} should be ${tarQuoteStart}text${tarQuoteEnd}`;
                } else {
                    value.highlight = `Target: ${tar}<e0></e0>`;
                    value.description = `Quotes are missing in the target. Quote style for the the locale ${locale} should be ${tarQuoteStart}text${tarQuoteEnd}`;
                }
                if (typeof(options.lineNumber) !== 'undefined') {
                    value.lineNumber = options.lineNumber;
                }
                return new Result(value);
            }
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