/*
 * ResourceICUPluralTranslation.js - rule to check formatjs/ICU style plurals
 * in the target string actually have translations
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

import { IntlMessageFormat } from 'intl-messageformat';
import Locale from 'ilib-locale';
import { Rule, Result } from 'i18nlint-common';

// all the plural categories from CLDR
const allCategories = ["zero", "one", "two", "few", "many", "other"];

// Map the language to the set of plural categories that the language
// uses. If the language is not listed below, it uses the default
// list of plurals: "one" and "other"
const categoriesForLang = {
    "ja": [ "other" ],
    "zh": [ "other" ],
    "ko": [ "other" ],
    "th": [ "other" ],
    "lv": [ "zero", "one", "other" ],
    "ga": [ "one", "two", "other" ],
    "ro": [ "one", "few", "other" ],
    "lt": [ "one", "few", "other" ],
    "ru": [ "one", "few", "other" ],
    "uk": [ "one", "few", "other" ],
    "be": [ "one", "few", "other" ],
    "sr": [ "one", "few", "other" ],
    "hr": [ "one", "few", "other" ],
    "cs": [ "one", "few", "other" ],
    "sk": [ "one", "few", "other" ],
    "pl": [ "one", "few", "other" ],
    "sl": [ "one", "two", "few", "other" ],
    "ar": [ "zero", "one", "two", "few", "many", "other" ]
}

/**
 * @class Represent an ilib-lint rule.
 */
class ResourceICUPluralTranslation extends Rule {
    /**
     * Make a new rule instance.
     * @constructor
     */
    constructor(options) {
        super(options);
        this.name = "resource-icu-plurals-translated";
        this.description = "Ensure that plurals in translated resources are also translated";
        this.sourceLocale = (options && options.sourceLocale) || "en-US";
        this.link = "https://gihub.com/ilib-js/i18nlint/blob/main/docs/resource-icu-plurals-translated.md";
    }

    getRuleType() {
        return "resource";
    }

    reconstruct(nodes) {
        let result = "";

        for (let i = 0; i < nodes.length; i++) {
            switch (nodes[i].type) {
                case 1:
                    result += ` {${source[i].value} `;
                    break;

                case 2:
                    result += ` {${source[i].value}, number, ${source[i].style}} `;
                    break;
                
                case 3:
                    result += ` {${source[i].value}, date, ${source[i].style}} `;
                    break;

                case 4:
                    result += ` {${source[i].value}, time, ${source[i].style}} `;
                    break;

                case 5:
                    result += ` {${source[i].value}, selectordinal, `;
                    for (const category in source[i].options) {
                        result += `${category} {${reconstruct(source[i].options[category].value)} }`;
                    }
                    result += '} ';
                    break;

                case 6:
                    result += ` {${source[i].value}, plural, `;
                    for (const category in source[i].options) {
                        result += `${category} {${reconstruct(source[i].options[category].value)} }`;
                    }
                    result += '} ';
                    break;

                case 7:
                    result += " # ";
                    break;

                default:
                    substr += source[i].value;
                    break;
                
            }
        }

        return result;
    }

    traverse(source, target) {
        let substr = "";
        for (let i = 0; i < source.length; i++) {
            switch (source[i].type) {
                case 6:
                    for (const category in source[i].options) {
                        
                    }
                    break;
                default:
                    substr += source[i].value;
                    break;
            }
        }
    }

    checkString(src, tar, file, resource, sourceLocale, targetLocale, lineNumber) {
        const sLoc = new Locale(sourceLocale);
        const tLoc = new Locale(targetLocale);

        // same language and script means that the translations are allowed to be the same as
        // the source
        if (sLoc.getLangSpec() === tLoc.getLangSpec()) return;

        let results;
        let problems = [];
        let sourceCategories;
        try {
            let imf = new IntlMessageFormat(src, sourceLocale);
            let ast = imf.getAst();
            sourceCategories = (ast && ast[0]?.options) || {};

            imf = new IntlMessageFormat(tar, targetLocale);
            ast = imf.getAst();
            targetCategories = (ast && ast[0]?.options) || {};
        } catch (e) {
            // ignore plural syntax errors -- that's a different rule
            return;
        }

        const categories = Object.keys(targetCategories);

        categories.forEach((category) => {
            if (sourceCategories[category] && targetCategories[category] === sourceCategories[category]) {
                let value = {
                    severity: "warning",
                    description: `Plural category \'${category}\' is the same as the source and does not seem to be translated.`,
                    rule: this,
                    id: resource.getKey(),
                    source: src,
                    highlight: `Target: <e0>${category} {${targetCategories[category]}}</e0>`,
                    pathName: file
                };
                if (typeof(lineNumber) !== 'undefined') {
                    value.lineNumber = lineNumber;
                }
                problems.push(new Result(value));
            }
        });

        return problems.length < 2 ? problems[0] : problems;
    }

    /**
     * @override
     */
    match(options) {
        const { resource, file } = options;
        const sourceLocale = this.sourceLocale;
        let problems = [];

        switch (resource.getType()) {
            case 'string':
                const tarString = resource.getTarget();
                if (tarString) {
                    return this.checkString(resource.getSource(), tarString, file, resource, sourceLocale, options.locale, options.lineNumber);
                }
                break;

            case 'array':
                const srcArray = resource.getSource();
                const tarArray = resource.getTarget();
                if (tarArray) {
                    return srcArray.map((item, i) => {
                        if (i < tarArray.length && tarArray[i]) {
                            return this.checkString(srcArray[i], tarArray[i], file, resource, sourceLocale, options.locale, options.lineNumber);
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
                    return categories.map(category => {
                        return this.checkString(srcPlural.other, tarPlural[category], file, resource, sourceLocale, options.locale, options.lineNumber);
                    });
                }
                break;
        }
    }

    // no match
    return;
}

export default ResourceICUPluralTranslation;