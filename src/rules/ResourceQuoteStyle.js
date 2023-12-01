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
import Locale from 'ilib-locale';
import { Rule, Result } from 'i18nlint-common';

import ResourceRule from './ResourceRule.js';

let LICache = {};
let regExpsCache = {};

// superset of all the non-ASCII start and end chars used in CLDR
const quoteChars = "«»‘“”„「」’‚‹›『』";

// shared between all locales since there is nothing locale-specific in here
const quotesAscii = new RegExp(`((^|\\W)"\\s?\\p{Letter}|\\p{Letter}\\s?"(\\W|$))`, "gu");
// leave out the "s" before the final quote to take care of plural possessives (eg. my colleagues' files.)
const quotesAsciiAlt = new RegExp(`((^|\\W)'\\s?\\p{Letter}|[a-rt-zA-RT-Z]\\s?'(\\W|$))`, "gu");

/**
 * @class Represent an ilib-lint rule.
 */
class ResourceQuoteStyle extends ResourceRule {
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
        if (!this.skipLocales) {
            this.skipLocales = new Set();
        }
        
        [
            "sv-SE", // According to the MS Style guidelines, quotes are usually not required in Swedish when the source English text contains quotes
            "it-IT", // Based on feedback from linguists quotes in Italian are not required to be the guillemets, even though CLDR says so
        ].forEach(locale => this.skipLocales.add(locale));   
    }

    /**
     * @private
     */
    checkString(src, tar, resource, file, locale, regExps) {
        quotesAscii.lastIndex = 0;
        quotesAsciiAlt.lastIndex = 0;
        regExps.source.quotesNative.lastIndex = 0;
        regExps.source.quotesNativeAlt.lastIndex = 0;
        regExps.target.quotesAll.lastIndex = 0;
        regExps.target.quotesAllAlt.lastIndex = 0;
        regExps.target.quotesNative.lastIndex = 0;
        regExps.target.quotesNativeAlt.lastIndex = 0;

        const asciiMatches = src.match(quotesAscii);
        const asciiMatchesAlt = src.match(quotesAsciiAlt);
        const nativeMatches = src.match(regExps.source.quotesNative);
        const nativeMatchesAlt = src.match(regExps.source.quotesNativeAlt);

        // see if we need to check the target
        if (!asciiMatches && !asciiMatchesAlt && !nativeMatches && !nativeMatchesAlt) return;

        let re1, re2;

        // used in results to show what the expected quote style is
        const quoteStyle = (asciiMatches || nativeMatches) ?
            `${regExps.target.quoteStart}text${regExps.target.quoteEnd}` :
            `${regExps.target.quoteStartAlt}text${regExps.target.quoteEndAlt}`;

        // match the appropriate regexp. The re1 and re2 are for the highlight field
        if (asciiMatches) {
            if (tar.match(regExps.target.quotesAll)) return;
            re1 = new RegExp(`(^|\\W)([${regExps.target.nonQuoteChars}'])(\\p{Letter})`, "gu");
            re2 = new RegExp(`(\\p{Letter})([${regExps.target.nonQuoteChars}'])(\\W|$)`, "gu");
        } else if (asciiMatchesAlt) {
            if (tar.match(regExps.target.quotesAllAlt)) return;
            re1 = new RegExp(`(^|\\W)[${regExps.target.nonQuoteCharsAlt}"](\\p{Letter})`, "gu");
            re2 = new RegExp(`(\\p{Letter})([${regExps.target.nonQuoteCharsAlt}"])(\\W|$)`, "gu");
        } else if (nativeMatches) {
            if (tar.match(regExps.target.quotesNative)) return;
            re1 = new RegExp(`(^|\\W)([${regExps.target.nonQuoteChars}'"])(\\p{Letter})`, "gu");
            re2 = new RegExp(`(\\p{Letter})([${regExps.target.nonQuoteChars}'"])(\\W|$)`, "gu");
        } else if (nativeMatchesAlt) {
            if (tar.match(regExps.target.quotesNativeAlt)) return;
            re1 = new RegExp(`(^|\\W)([${regExps.target.nonQuoteCharsAlt}'"])(\\p{Letter})`, "gu");
            re2 = new RegExp(`(\\p{Letter})([${regExps.target.nonQuoteCharsAlt}'"])(\\W|$)`, "gu");
        }
        const matches1 = re1 ? re1.exec(tar) : undefined;
        const matches2 = re2 ? re2.exec(tar) : undefined;

        let value = {
            severity: this.localeOnly ? "error" : "warning",
            id: resource.getKey(),
            source: src,
            rule: this,
            locale,
            pathName: file
        };
        if (matches1 || matches2) {
            value.highlight = `Target: ${tar.replace(re1, "$1<e0>$2</e0>$3").replace(re2, "$1<e1>$2</e1>$3")}`;
            value.description = `Quote style for the locale ${locale} should be ${quoteStyle}`;
        } else {
            value.highlight = `Target: ${tar}<e0></e0>`;
            value.description = `Quotes are missing in the target. Quote style for the locale ${locale} should be ${regExps.target.quoteStart}text${regExps.target.quoteEnd}`;
        }
        if (typeof(resource.lineNumber) !== 'undefined') {
            value.lineNumber = resource.lineNumber;
        }
        return new Result(value);
    }

    /**
     * Calculate all the regular expressions we need.
     * @private
     */
    getRegExps(locale) {
        if (regExpsCache[locale]) return regExpsCache[locale];

        // store quote chars and regexps in here and then cache it
        // so we only do it once for each locale
        let regExps = {
            source: {},
            target: {}
        };

        // locale info object will tell us the quote chars for the locale
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

        // what are all the quote chars that this locale uses?
        regExps.source.quoteStart = sourceLI.getDelimiterQuotationStart();
        regExps.source.quoteStartAlt = sourceLI.info.delimiter.alternateQuotationStart;

        regExps.source.quoteEnd = sourceLI.getDelimiterQuotationEnd();
        regExps.source.quoteEndAlt = sourceLI.info.delimiter.alternateQuotationEnd;

        regExps.target.quoteStart = li.getDelimiterQuotationStart();
        regExps.target.quoteStartAlt = li.info.delimiter.alternateQuotationStart;

        regExps.target.quoteEnd = li.getDelimiterQuotationEnd();
        regExps.target.quoteEndAlt = li.info.delimiter.alternateQuotationEnd;

        // now calculate regular expressions for the source string that use those quotes
        // if the source uses ASCII quotes, then the target could have ASCII or native quotes
        regExps.source.quotesNative = new RegExp(`((^|\\W)${regExps.source.quoteStart}\\s?\\p{Letter}|\\p{Letter}\\s?${regExps.source.quoteEnd}(\\W|$))`, "gu");
        regExps.source.quotesNativeAlt = new RegExp(`((^|\\W)${regExps.source.quoteStartAlt}\\s?\\p{Letter}|\\p{Letter}\\s?${regExps.source.quoteEndAlt}(\\W|$))`, "gu");

        // now calculate the regular expressions for the target string that use quotes
        // if the source contains native quotes, then the target should also have native quotes
        regExps.target.quotesNative = new RegExp(`((^|\\W)${regExps.target.quoteStart}\\s?\\p{Letter}|\\p{Letter}\\s?${regExps.target.quoteEnd}(\\W|$))`, "gu");
        regExps.target.quotesNativeAlt = new RegExp(`((^|\\W)${regExps.target.quoteStartAlt}\\s?\\p{Letter}|\\p{Letter}\\s?${regExps.target.quoteEndAlt}(\\W|$))`, "gu");
        regExps.target.quotesAll = this.localeOnly ?
            regExps.target.quotesNative :
            new RegExp(`((^|\\W)[${regExps.target.quoteStart}${regExps.target.quoteStartAlt}"]\\s?\\p{Letter}|\\p{Letter}\\s?[${regExps.target.quoteEnd}${regExps.target.quoteEndAlt}"](\\W|$))`, "gu");
        regExps.target.quotesAllAlt = this.localeOnly ?
            regExps.target.quotesNativeAlt :
            new RegExp(`((^|\\W)[${regExps.target.quoteStartAlt}']\\s?\\p{Letter}|\\p{Letter}\\s?[${regExps.target.quoteEndAlt}'](\\W|$))`, "gu");

        // the non quote chars are used to highlight errors in the target string
        regExps.target.nonQuoteChars = quoteChars.
                replace(regExps.source.quoteStart, "").
                replace(regExps.target.quoteStart, "").
                replace(regExps.source.quoteEnd, "").
                replace(regExps.target.quoteEnd, "");
        regExps.target.nonQuoteCharsAlt = quoteChars.
                replace(regExps.source.quoteStartAlt, "").
                replace(regExps.target.quoteStartAlt, "").
                replace(regExps.source.quoteEndAlt, "").
                replace(regExps.target.quoteEndAlt, "");

        regExpsCache[locale] = regExps;
        return regExps;
    }

    /**
     * @override
     */
    matchString({source, target, resource, file}) {
        if (!source || !target) return; // cannot match in strings that don't exist!
        const locale = resource.getTargetLocale();
        const regExps = this.getRegExps(locale);
        return this.checkString(source, target, resource, file, locale, regExps);
    }
}

export default ResourceQuoteStyle;