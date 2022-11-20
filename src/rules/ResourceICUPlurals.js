/*
 * ResourceICUPlurals.js - rule to check formatjs/ICU style plurals in the target string
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

import { IntlMessageFormat } from 'intl-messageformat';
import Locale from 'ilib-locale';

import Rule from '../Rule.js';

// all the plural categories from CLDR
const categories = ["zero", "one", "two", "few", "many", "other"];

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

function checkPluralCategories(ast, neededCategories, isSource, src, key) {
    let value = [];
    for (let i = 0; i < ast.length; i++) {
        const opts = ast[i].options;
        if (opts) {
            const missing = neededCategories.filter(category => {
                return typeof(opts[category]) === 'undefined';
            });
            if ( missing && missing.length ) {
                value.push({
                    severity: "error",
                    description: `Missing plural categories in ${isSource ? "source" : "target"} string: ${missing.join(", ")}. Expecting all of these: ${neededCategories.join(", ")}`,
                    id: key,
                    highlight: `${isSource ? "Source" : "Target"}: ${src}<e0></e0>`
                });
            }
            for (let category in opts) {
                if ( opts[category] && Array.isArray(opts[category].value) ) {
                    value = value.concat(checkPluralCategories(opts[category].value, neededCategories, isSource, src, key));
                }
            }
        }
    }
    return value;
}

/**
 * @class Represent an i18nlint rule.
 * @abstract
 */
class ResourceICUPlurals extends Rule {
    constructor(options) {
        super(options);
        this.name = "resources-icu-plurals";
        this.description = "Ensure that plurals in translated resources have the correct syntax";
        this.sourceLocale = (options && options.sourceLocale) || "en-US";
    }

    getRuleType() {
        return "resource";
    }

    match(options) {
        const { resource } = options;
        const sourceLocale = this.sourceLocale;
        const sLoc = new Locale(sourceLocale);
        const tLoc = new Locale(options.locale);
        let problems = [];

        function checkString(src, tar) {
            let results;
            try {
                const imf = new IntlMessageFormat(src, sourceLocale);
                const categories = categoriesForLang[sLoc.getLanguage()] || [ "one", "other" ];
                // look in the abstract syntax tree for the categories that were parsed out and make
                // sure the required ones are there
                const ast = imf.getAst();
                problems = problems.concat(checkPluralCategories(ast, categories, true, src, resource.getKey()));
            } catch (e) {
                console.log(e);
                let value = {
                    severity: "error",
                    description: `Incorrect plural or select syntax in source string: ${e}`,
                    id: resource.getKey(),
                    highlight: `Source: ${src.substring(0, e.location.end.offset)}<e0>${src.substring(e.location.end.offset)}</e0>`
                };
                if (typeof(options.lineNumber) !== 'undefined') {
                    value.lineNumber = options.lineNumber + e.location.end.line - 1;
                }
                problems.push(value);
            }
            try {
                const imf = new IntlMessageFormat(tar, options.locale);
                const categories = categoriesForLang[tLoc.getLanguage()] || [ "one", "other" ];
                // look in the abstract syntax tree for the categories that were parsed out and make
                // sure the required ones are there
                const ast = imf.getAst();
                problems = problems.concat(checkPluralCategories(ast, categories, false, tar, resource.getKey()));
            } catch (e) {
                let value = {
                    severity: "error",
                    description: `Incorrect plural or select syntax in target string: ${e}`,
                    id: resource.getKey(),
                    highlight: `Source: ${src}\nTarget: ${tar.substring(0, e.location.end.offset)}<e0>${tar.substring(e.location.end.offset)}</e0>`
                };
                if (typeof(options.lineNumber) !== 'undefined') {
                    value.lineNumber = options.lineNumber + e.location.end.line - 1;
                }
                problems.push(value);
            }
            return problems.length < 2 ? problems[0] : problems;
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
                    return categories.map(category => {
                        return checkString(srcPlural.other, tarPlural[category]);
                    });
                }
                break;
        }
    }

    // no match
    return;
}

export default ResourceICUPlurals;