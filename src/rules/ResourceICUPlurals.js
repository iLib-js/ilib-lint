/*
 * ResourceICUPlurals.js - rule to check formatjs/ICU style plurals in the target string
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

import { IntlMessageFormat } from 'intl-messageformat';
import Locale from 'ilib-locale';
import { Result } from 'i18nlint-common';

import ResourceRule from './ResourceRule.js';

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
class ResourceICUPlurals extends ResourceRule {
    /**
     * Make a new rule instance.
     * @constructor
     */
    constructor(options) {
        super(options);
        this.name = "resource-icu-plurals";
        this.description = "Ensure that plurals in translated resources have the correct syntax";
        this.sourceLocale = (options && options.sourceLocale) || "en-US";
        this.link = "https://gihub.com/ilib-js/i18nlint/blob/main/docs/resource-icu-plurals.md";
    }

    /**
     * @private
     */
    checkPluralCategories(ast, neededCategories, stringToCheck, key, pathName, source, locale) {
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
                        description: `Missing categories in target string: ${missing.join(", ")}. Expecting these: ${neededCategories.join(", ")}`,
                        id: key,
                        highlight: `Target: ${stringToCheck}<e0></e0>`,
                        pathName,
                        source,
                        locale
                    };
                    value.push(new Result(opts));
                }
                for (let category in opts) {
                    if ( opts[category] && Array.isArray(opts[category].value) ) {
                        value = value.concat(this.checkPluralCategories(opts[category].value, neededCategories, stringToCheck, key, pathName, source, locale));
                    }
                }
                // now check the other way around. That is, if the categories that exist are not needed.
                const extras = Object.keys(opts).filter(category => {
                    return neededCategories.indexOf(category) < 0;
                });
                if (extras && extras.length) {
                    let opts = {
                        severity: "warning",
                        rule: this,
                        description: `Extra categories in target string: ${extras.join(", ")}. Expecting only these: ${neededCategories.join(", ")}`,
                        id: key,
                        highlight: `Target: ${stringToCheck}<e0></e0>`,
                        pathName,
                        source,
                        locale
                    };
                    value.push(new Result(opts));
                }
            }
        }
        return value;
    }

    matchCategories(sourceSelect, targetSelect, locale) {
        let problems = [];

        let categories;
        if (sourceSelect.node.pluralType === "cardinal") {
            categories = categoriesForLang[locale.getLanguage()] || [ "one", "other" ];
        } else {
            // for select or selectordinal, only the "other" category is required
            categories = [ "other" ];
        }
        if (sourceSelect.categories.length) {
            categories = categories.concat(sourceSelect.categories);
        }

        const missing = categories.filter(category => {
            if (!targetSelect.node.options[category]) {
                return category;
            } else if (sourceSelect.node.options[category]) {
                problems = problems.concat(this.checkNodes(
                    sourceSelect.node.options[category].children,
                    targetSelect.node.options[category].children,
                    locale
                ));
            }
        });
        if (missing.length) {
            let opts = {
                severity: "error",
                rule: this,
                description: `Missing categories in target string: ${missing.join(", ")}. Expecting these: ${neededCategories.join(", ")}`,
                id: key,
                highlight: `Target: ${stringToCheck}<e0></e0>`,
                pathName,
                source,
                locale
            };
            problems.push(new Result(opts));
        }

        return problems;
    }
    
    findSelects(ast) {
        let selects = {};

        ast.forEach(node => {
            // selectordinal || plural/select
            if (node.type === 5 || node.type === 6) {
                // make sure the name is unique
                let name = node.value;
                let index = 0;
                while (selects[name]) {
                    name = node.value + index++;
                }
                selects[name] = {
                    node,
                    categories: Object.keys(node.options).filter(category => {
                        // if it is not one of the standard categories, it is a special one, so search for it
                        return allCategories.indexOf(category) < 0;
                    })
                };
                
            }
        });

        return selects;
    }
    
    checkNodes(sourceAst, targetAst, locale) {
        const sourceSelects = this.findSelects(sourceAst);
        const targetSelects = this.findSelects(targetAst);
        let problems = [];
        
        Object.keys(targetSelects).forEach(select => {
            const targetSelect = targetSelects[select];
            if (sourceSelects[select]) {
                problems = problems.concat(this.matchCategories(sourceSelects[select], targetSelect, locale));
            } else {
                const targetSnippet = target;
                let opts = {
                    severity: "error",
                    rule: this,
                    description: `Select or plural with pivot variable ${targetSelects[select].node.value} does not exist in the source string. Possible translated variable name.`,
                    id: key,
                    highlight: `Target: <e0>{</e0>`,
                    pathName,
                    source,
                    locale
                };
                value.push(new Result(opts));
            }
        });
        
        return problems;
    }

    matchString({source, target, file, resource}) {
        const sLoc = new Locale(resource.getSourceLocale());
        const tLoc = new Locale(resource.getTargetLocale());
        let results;
        let problems = [];
        let sourceCategories = [];
        let pluralType;
        let sourceSelects, targetSelects;

        try {
            const imf = new IntlMessageFormat(source, sLoc.getSpec());
            // look in the abstract syntax tree for the categories that were parsed out and make
            // sure the required ones are there
            sourceSelects = this.findSelects(imf.getAst());
        } catch (e) {
            // if there are problems in the source string, do not check the target string because we
            // do not have anything good to match against
            return undefined;
        }
        try {
            const imf = new IntlMessageFormat(target, tLoc.getSpec());
            targetSelects = this.findSelects(imf.getAst());

            let categories;
            if (pluralType === "cardinal") {
                categories = categoriesForLang[tLoc.getLanguage()] || [ "one", "other" ];
            } else {
                // for select or selectordinal, only the "other" category is required
                categories = [ "other" ];
            }
            if (sourceCategories.length) {
                categories = categories.concat(sourceCategories);
            }
            // look in the abstract syntax tree for the categories that were parsed out and make
            // sure the required ones are there
            const ast = imf.getAst();
            problems = problems.concat(this.checkPluralCategories(ast, categories, target, resource.getKey(), file, source, tLoc.getSpec()));
        } catch (e) {
            let value = {
                severity: "error",
                description: `Incorrect plural or select syntax in target string: ${e}`,
                rule: this,
                id: resource.getKey(),
                source,
                highlight: `Target: ${target.substring(0, e.location.end.offset)}<e0>${target.substring(e.location.end.offset)}</e0>`,
                pathName: file,
                locale: tLoc.getSpec()
            };
            if (typeof(resource.lineNumber) !== 'undefined') {
                value.lineNumber = resource.lineNumber + e.location.end.line - 1;
            }
            problems.push(new Result(value));
        }
        return problems.length < 2 ? problems[0] : problems;
    }
}

export default ResourceICUPlurals;