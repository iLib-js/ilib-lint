/*
 * ResourceQuoteStyle.js - rule to check quotes in the target string
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

import LocaleInfo from 'ilib-localeinfo';

import Rule from '../Rule.js';

let LICache = {};

// superset of all the start and end chars used in CLDR
const quoteChars = "«»‘“”„「」’‚‹›『』\"\'";

/**
 * @class Represent an i18nlint rule.
 * @abstract
 */
class ResourceQuoteStyle extends Rule {
    constructor(options) {
        super(options);
        this.name = "resources-quote-style";
        this.description = "Ensure that the proper quote characters are used in translated resources";
        this.sourceLocale = (options && options.sourceLocale) || "en-US";
    }

    getRuleType() {
        return "resource";
    }

    match(options) {
        const { locale, resource } = options || {};
        let li = LICache[locale];

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
        const srcQuoteEnd = sourceLI.getDelimiterQuotationEnd();
        const srcAltQuoteStart = sourceLI.info.delimiter.alternateQuotationStart;
        const srcAltQuoteEnd = sourceLI.info.delimiter.alternateQuotationEnd;
        const tarQuoteStart = li.getDelimiterQuotationStart();
        const tarQuoteEnd = li.getDelimiterQuotationEnd();
        const tarAltQuoteStart = li.info.delimiter.alternateQuotationStart;
        const tarAltQuoteEnd = li.info.delimiter.alternateQuotationEnd;
        
        const srcQuotes = `([${srcQuoteStart}${srcQuoteEnd}${srcAltQuoteStart}${srcAltQuoteEnd}'"])`;
        const tarQuotes = `([${tarQuoteStart}${tarQuoteEnd}${tarAltQuoteStart}${tarAltQuoteEnd}])`;
        
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

        function checkString(src, tar) {
            if (src.match(new RegExp(srcQuotes))) {
                // contains quotes, so check the target
                if (!tar.match(new RegExp(tarQuotes))) {
                    let value = {
                        severity: "warning",
                        description: `quote style for the the locale ${options.locale} should be ${tarQuoteStart}text${tarQuoteEnd}`,
                        id: resource.getKey(),
                        highlight: `Source: ${src}\nTarget: ${tar.replace(re, "<e0>$1</e0>")}`
                    };
                    if (typeof(options.lineNumber) !== 'undefined') {
                        value.lineNumber = options.lineNumber;
                    }
                    return value;
                }
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