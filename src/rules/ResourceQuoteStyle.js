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
import { Result } from 'ilib-lint-common';

import ResourceRule from './ResourceRule.js';

/** 
 * @typedef BaseRegExpCollection
 * @type {object}
 * @prop {string} quoteStart
 * @prop {string} quoteStartAlt
 * @prop {string} quoteEnd
 * @prop {string} quoteEndAlt
 * @prop {RegExp} quotesNative
 * @prop {RegExp} quotesNativeAlt
 * 
 * @typedef {BaseRegExpCollection} SourceRegExpCollection
 */

/**
 * @typedef ExtendedRegExpCollection
 * @type {object}
 * @prop {RegExp} quotesAll
 * @prop {RegExp} quotesAllAlt
 * @prop {string} nonQuoteChars
 * @prop {string} nonQuoteCharsAlt
 * 
 * @typedef {BaseRegExpCollection & ExtendedRegExpCollection} TargetRegExpCollection
 */

/**
 * @typedef RegExpCollectionForLocale
 * @type {object}
 * @prop {SourceRegExpCollection} source
 * @prop {TargetRegExpCollection} target
 */

let /** @type {{[locale: string]: LocaleInfo}} */LICache = {};
let /** @type {{[locale: string]: RegExpCollectionForLocale}} */ regExpsCache = {};

// superset of all the non-ASCII start and end chars used in CLDR
const quoteChars = "«»‘“”„「」’‚‹›『』";

// shared between all locales since there is nothing locale-specific in here
const quotesAscii = new RegExp(`((^|\\W)"\\s?[\\p{Letter}\\{]|[\\p{Letter}\\}]\\s?"(\\W|$))`, "gu");
// leave out the "s" before the final quote to take care of plural possessives (eg. my colleagues' files.)
const quotesAsciiAlt = new RegExp(`((^|\\W)'\\s?[\\p{Letter}\\{]|[a-rt-zA-RT-Z\\}]\\s?'(\\W|$))`, "gu");

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
        this.link = "https://github.com/ilib-js/ilib-lint/blob/main/docs/resource-quote-style.md";
        if (!this.skipLocales) {
            this.skipLocales = new Set();
        }
        
        [
            "sv", // According to the MS Style guidelines, quotes are usually not required in Swedish when the source English text contains quotes
            "it", // Based on feedback from linguists quotes in Italian are not required to be the guillemets, even though CLDR says so
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
            re1 = new RegExp(`(^|\\W)([${regExps.target.nonQuoteChars}'])([\\p{Letter}\\{])`, "gu");
            re2 = new RegExp(`([\\p{Letter}\\}])([${regExps.target.nonQuoteChars}'])(\\W|$)`, "gu");
        } else if (asciiMatchesAlt) {
            if (tar.match(regExps.target.quotesAllAlt)) return;
            re1 = new RegExp(`(^|\\W)[${regExps.target.nonQuoteCharsAlt}"]([\\p{Letter}\\{])`, "gu");
            re2 = new RegExp(`([\\p{Letter}\\}])([${regExps.target.nonQuoteCharsAlt}"])(\\W|$)`, "gu");
        } else if (nativeMatches) {
            if (tar.match(regExps.target.quotesNative)) return;
            re1 = new RegExp(`(^|\\W)([${regExps.target.nonQuoteChars}'"])([\\p{Letter}\\{])`, "gu");
            re2 = new RegExp(`([\\p{Letter}\\}])([${regExps.target.nonQuoteChars}'"])(\\W|$)`, "gu");
        } else if (nativeMatchesAlt) {
            if (tar.match(regExps.target.quotesNativeAlt)) return;
            re1 = new RegExp(`(^|\\W)([${regExps.target.nonQuoteCharsAlt}'"])([\\p{Letter}\\{])`, "gu");
            re2 = new RegExp(`([\\p{Letter}\\}])([${regExps.target.nonQuoteCharsAlt}'"])(\\W|$)`, "gu");
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
            value.highlight = tar;
            if (re1) { value.highlight = value.highlight.replace(re1, "$1<e0>$2</e0>$3"); }
            if (re2) { value.highlight = value.highlight.replace(re2, "$1<e1>$2</e1>$3"); }
            value.highlight = `Target: ${value.highlight}`;
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
     * @param {string} locale
     * @returns {RegExpCollectionForLocale}
     */
    getRegExps(locale) {
        if (regExpsCache[locale]) return regExpsCache[locale];
    
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
        const sourceQuoteStart = sourceLI.getDelimiterQuotationStart();
        const sourceQuoteStartAlt = /** @type {string} */ (sourceLI.info.delimiter.alternateQuotationStart);
    
        const sourceQuoteEnd = sourceLI.getDelimiterQuotationEnd();
        const sourceQuoteEndAlt = /** @type {string} */ (sourceLI.info.delimiter.alternateQuotationEnd);
    
        const targetQuoteStart = li.getDelimiterQuotationStart();
        const targetQuoteStartAlt = /** @type {string} */ (li.info.delimiter.alternateQuotationStart);
    
        const targetQuoteEnd = li.getDelimiterQuotationEnd();
        const targetQuoteEndAlt = /** @type {string} */ (li.info.delimiter.alternateQuotationEnd);
    
        // now calculate regular expressions for the source string that use those quotes
        // if the source uses ASCII quotes, then the target could have ASCII or native quotes
        const sourceQuotesNative = new RegExp(`((^|\\W)${sourceQuoteStart}\\s?[\\p{Letter}\\{]|[\\p{Letter}\\}]\\s?${sourceQuoteEnd}(\\W|$))`, "gu");
        const sourceQuotesNativeAlt = new RegExp(`((^|\\W)${sourceQuoteStartAlt}\\s?[\\p{Letter}\\{]|[\\p{Letter}\\}]\\s?${sourceQuoteEndAlt}(\\W|$))`, "gu");
    
        // now calculate the regular expressions for the target string that use quotes
        // if the source contains native quotes, then the target should also have native quotes
        const targetQuotesNative = new RegExp(`((^|\\W)${targetQuoteStart}\\s?[\\p{Letter}\\{]|[\\p{Letter}\\}]\\s?${targetQuoteEnd}(\\W|$))`, "gu");
        const targetQuotesNativeAlt = new RegExp(`((^|\\W)${targetQuoteStartAlt}\\s?[\\p{Letter}\\{]|[\\p{Letter}\\}]\\s?${targetQuoteEndAlt}(\\W|$))`, "gu");
        const targetQuotesAll = this.localeOnly ?
            targetQuotesNative :
            new RegExp(`((^|\\W)[${targetQuoteStart}${targetQuoteStartAlt}"]\\s?[\\p{Letter}\\{]|[\\p{Letter}\\}]\\s?[${targetQuoteEnd}${targetQuoteEndAlt}"](\\W|$))`, "gu");
        const targetQuotesAllAlt = this.localeOnly ?
            targetQuotesNativeAlt :
            new RegExp(`((^|\\W)[${targetQuoteStartAlt}']\\s?[\\p{Letter}\\{]|[\\p{Letter}\\}]\\s?[${targetQuoteEndAlt}'](\\W|$))`, "gu");
    
        // the non quote chars are used to highlight errors in the target string
        const targetNonQuoteChars = quoteChars.
                replace(sourceQuoteStart, "").
                replace(targetQuoteStart, "").
                replace(sourceQuoteEnd, "").
                replace(targetQuoteEnd, "");
        const targetNonQuoteCharsAlt = quoteChars.
                replace(sourceQuoteStartAlt, "").
                replace(targetQuoteStartAlt, "").
                replace(sourceQuoteEndAlt, "").
                replace(targetQuoteEndAlt, "");

        // store quote chars and regexps in here and then cache it
        // so we only do it once for each locale
        let /** @type {RegExpCollectionForLocale} */ regExps = {
            source: {
                quoteStart: sourceQuoteStart,
                quoteStartAlt: sourceQuoteStartAlt,
                quoteEnd: sourceQuoteEnd,
                quoteEndAlt: sourceQuoteEndAlt,
                quotesNative: sourceQuotesNative,
                quotesNativeAlt: sourceQuotesNativeAlt,
            },
            target: {
                quoteStart: targetQuoteStart,
                quoteStartAlt: targetQuoteStartAlt,
                quoteEnd: targetQuoteEnd,
                quoteEndAlt: targetQuoteEndAlt,
                quotesNative: targetQuotesNative,
                quotesNativeAlt: targetQuotesNativeAlt,
                quotesAll: targetQuotesAll,
                quotesAllAlt: targetQuotesAllAlt,
                nonQuoteChars: targetNonQuoteChars,
                nonQuoteCharsAlt: targetNonQuoteCharsAlt,
            }
        };

        regExpsCache[locale] = regExps;
        return regExps;
    }

    /**
     * @override
     */
    matchString({source, target, resource, file}) {
        if (!source || !target) return; // cannot match in strings that don't exist!
        const locale = resource.getTargetLocale();
        if (!locale) return; // nothing to do if there is no target locale specified
        const regExps = this.getRegExps(locale);
        return this.checkString(source, target, resource, file, locale, regExps);
    }
}

export default ResourceQuoteStyle;