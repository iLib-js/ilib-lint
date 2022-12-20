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
import Result from '../Result.js';

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
class ResourceICUPlurals extends Rule {
    constructor(options) {
        super(options);
        this.name = "resource-icu-plurals";
        this.description = "Ensure that plurals in translated resources have the correct syntax";
        this.sourceLocale = (options && options.sourceLocale) || "en-US";
    }

    getRuleType() {
        return "resource";
    }

    /**
     * @private
     */
    checkPluralCategories(ast, neededCategories, isSource, stringToCheck, key, pathName, source) {
        let value = [];
        for (let i = 0; i < ast.length; i++) {
            const opts = ast[i].options;
            if (opts) {
                // check if any of the needed categories are missing
                const missing = neededCategories.filter(category => {
                    return typeof(opts[category]) === 'undefined';
                });
                if ( missing && missing.length ) {
                    let opts = {
                        severity: "error",
                        rule: this,
                        description: `Missing plural categories in ${isSource ? "source" : "target"} string: ${missing.join(", ")}. Expecting these: ${neededCategories.join(", ")}`,
                        id: key,
                        highlight: `${isSource ? "Source" : "Target"}: ${stringToCheck}<e0></e0>`,
                        pathName,
                        source
                    };
                    value.push(new Result(opts));
                }
                for (let category in opts) {
                    if ( opts[category] && Array.isArray(opts[category].value) ) {
                        value = value.concat(this.checkPluralCategories(opts[category].value, neededCategories, isSource, stringToCheck, key, pathName, source));
                    }
                }
                // now check the other way around. That is, if the categories that exist are not needed.
                if (!isSource) {
                    const extras = Object.keys(opts).filter(category => {
                        return neededCategories.indexOf(category) < 0;
                    });
                    if (extras && extras.length) {
                        let opts = {
                            severity: "warning",
                            rule: this,
                            description: `Extra plural categories in ${isSource ? "source" : "target"} string: ${extras.join(", ")}. Expecting only these: ${neededCategories.join(", ")}`,
                            id: key,
                            highlight: `${isSource ? "Source" : "Target"}: ${stringToCheck}<e0></e0>`,
                            pathName,
                            source
                        };
                        value.push(new Result(opts));
                    }
                }
            }
        }
        return value;
    }

    checkString(src, tar, file, resource, sourceLocale, targetLocale, lineNumber) {
        const sLoc = new Locale(sourceLocale);
        const tLoc = new Locale(targetLocale);
        let results;
        let problems = [];
        let sourceCategories = [];
        try {
            const imf = new IntlMessageFormat(src, sourceLocale);
            let categories = categoriesForLang[sLoc.getLanguage()] || [ "one", "other" ];
            // look in the abstract syntax tree for the categories that were parsed out and make
            // sure the required ones are there
            const ast = imf.getAst();
            problems = problems.concat(this.checkPluralCategories(ast, categories, true, src, resource.getKey(), file, resource.getSource()));
            if ( ast[0] && ast[0].options ) {
                sourceCategories = Object.keys(ast[0].options).filter(category => {
                    // if it is not one of the standard categories, it is a special one, so search for it
                    // in the target too
                    return allCategories.indexOf(category) < 0;
                });
            }
        } catch (e) {
            let value = {
                pathName: file,
                severity: "error",
                rule: this,
                description: `Incorrect plural or select syntax in source string: ${e}`,
                id: resource.getKey(),
                highlight: `Source: ${src.substring(0, e.location.end.offset)}<e0>${src.substring(e.location.end.offset)}</e0>`,
                pathName: file
            };
            if (typeof(lineNumber) !== 'undefined') {
                value.lineNumber = lineNumber + e.location.end.line - 1;
            }
            problems.push(new Result(value));
        }
        try {
            const imf = new IntlMessageFormat(tar, targetLocale);
            let categories = categoriesForLang[tLoc.getLanguage()] || [ "one", "other" ];
            if (sourceCategories.length) {
                categories = categories.concat(sourceCategories);
            }
            // look in the abstract syntax tree for the categories that were parsed out and make
            // sure the required ones are there
            const ast = imf.getAst();
            problems = problems.concat(this.checkPluralCategories(ast, categories, false, tar, resource.getKey(), file, resource.getSource()));
        } catch (e) {
            let value = {
                severity: "error",
                description: `Incorrect plural or select syntax in target string: ${e}`,
                rule: this,
                id: resource.getKey(),
                source: src,
                highlight: `Target: ${tar.substring(0, e.location.end.offset)}<e0>${tar.substring(e.location.end.offset)}</e0>`,
                pathName: file
            };
            if (typeof(lineNumber) !== 'undefined') {
                value.lineNumber = lineNumber + e.location.end.line - 1;
            }
            problems.push(new Result(value));
        }
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

export default ResourceICUPlurals;