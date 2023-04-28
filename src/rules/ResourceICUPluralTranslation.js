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

    /**
     * Given some ast nodes, reconstruct the string that it came from, glossing
     * over the plurals and selects, which will be compared separately anyways.
     * Add spaces in between the parts so that later we can compress all the
     * spaces to normalize them. The idea is that we can show the following
     * have equivalent text in them:
     * "x" + "y" vs. " x" + " y "
     * Without adding the spaces and then compressing them before comparison,
     * the two would not be the same, even though the actual translatable text
     * in them is the same, which is what we were trying to get at. 
     * @private
     */
    reconstruct(nodes) {
        let result = "";

        for (let i = 0; i < nodes.length; i++) {
            switch (nodes[i].type) {
                case 1:
                    result += ` {${nodes[i].value}} `;
                    break;

                case 2:
                    result += ` {${nodes[i].value}, number, ${nodes[i].style}} `;
                    break;

                case 3:
                    result += ` {${nodes[i].value}, date, ${nodes[i].style}} `;
                    break;

                case 4:
                    result += ` {${nodes[i].value}, time, ${nodes[i].style}} `;
                    break;

                // for select ordinals and plurals, replace them with a fixed string
                // so that we don't match on the details of those subparts
                case 5:
                    result += ` {selectordinal} `;
                    break;

                case 6:
                    result += ` {plural} `;
                    break;

                case 7:
                    result += " # ";
                    break;

                case 8:
                    result += `<${nodes[i].value}/>`;
                    break;

                default:
                    result += nodes[i].value;
                    break;
            }
        }

        return result;
    }

    /**
     * Traverse an array of ast nodes to find any embedded selects or plurals
     * or tags, and then process those separately.
     * @private
     */
    traverse(resource, file, source, target) {
        let sourcePlurals = {};
        let targetPlurals = {};
        let sourceTags = {};
        let targetTags = {};

        // Find the plurals and tags in this string and remember them according to their
        // unique name. We do this because the order of plurals and tags may change in
        // translations, so we have to go by the only part that doesn't change -- the name
        const maxNodes = Math.max(source.length, target.length);
        for (let i = 0; i < maxNodes; i++) {
            if (i < source.length) {
                // selectordinal or plural
                if (source[i].type === 5 || source[i].type === 6) {
                    sourcePlurals[source[i].value] = source[i];
                } else if (source[i].type === 8) {
                    sourceTags[source[i].value] = source[i];
                }
            }
            if (i < target.length) {
                if (target[i].type === 5 || target[i].type === 6) {
                    targetPlurals[target[i].value] = target[i];
                } else if (target[i].type === 8) {
                    targetTags[target[i].value] = target[i];
                }
            }
        }

        // for each plural, try to match it up with the target plural by name and check if
        // there is a translation
        let results = Object.keys(sourcePlurals).map(name => {
            const sourcePlural = sourcePlurals[name];
            const targetPlural = targetPlurals[name];
            if (!targetPlural) {
                // missing target plurals are for a different rule, so don't report it here
                return;
            }
            return Object.keys(targetPlural.options).map(category => {
                const sourceCategory = sourcePlural.options[category] ? category : "other";
                const sourcePluralCat = sourcePlural.options[sourceCategory];
                if (!sourcePluralCat) return; // nothing to check!

                const sourceStr = this.reconstruct(sourcePluralCat.value).replace(/\s+/g, " ").trim();
                const targetStr = this.reconstruct(targetPlural.options[category].value).replace(/\s+/g, " ").trim();
                let result = [];

                // use case- and whitespace-insensitive match
                if (sourceStr.toLowerCase() === targetStr.toLowerCase()) {
                    let value = {
                        severity: "warning",
                        description: `Translation of the category \'${category}\' is the same as the source.`,
                        rule: this,
                        id: resource.getKey(),
                        source: `${sourceCategory} {${sourceStr}}`,
                        highlight: `Target: <e0>${category} {${targetStr}}</e0>`,
                        pathName: file,
                        locale: resource.getTargetLocale()
                    };
                    if (typeof(resource.lineNumber) !== 'undefined') {
                        value.lineNumber = resource.lineNumber;
                    }
                    result.push(new Result(value));
                }

                // now the plurals may have plurals nested in them, so recursively check them too
                return result.concat(this.traverse(resource, file, sourcePluralCat.value, targetPlural.options[category].value));
             }).flat();
        }).flat();

        // now recursively handle the tags
        results = results.concat(Object.keys(sourceTags).map(name => {
            const sourceTag = sourceTags[name];
            const targetTag = targetTags[name];
            if (!targetTag) {
                // missing target tags are for a different rule, so don't report it here
                return;
            }
            return this.traverse(resource, file, sourceTag.children, targetTag.children);
        }).flat());
        return results;
    }

    /**
     * Check a string in a resource for missing translations of plurals or selects.
     * @private
     */
    checkString(src, tar, file, resource, sourceLocale, targetLocale, lineNumber) {
        const sLoc = new Locale(sourceLocale);
        const tLoc = new Locale(targetLocale);

        // same language and script means that the translations are allowed to be the same as
        // the source
        if (sLoc.getLangSpec() === tLoc.getLangSpec()) return;

        let sourceAst;
        let targetAst;
        try {
            let imf = new IntlMessageFormat(src, sourceLocale);
            sourceAst = imf.getAst();

            imf = new IntlMessageFormat(tar, targetLocale);
            targetAst = imf.getAst();
        } catch (e) {
            // ignore plural syntax errors -- that's a different rule
            return;
        }

        const results = this.traverse(resource, file, sourceAst, targetAst).filter(result => result);

        return (results && results.length < 2) ? results[0] : results;
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
                    return Object.keys(srcPlural).map(category => {
                        return this.checkString(srcPlural.other, tarPlural[category], file, resource, sourceLocale, options.locale, options.lineNumber);
                    });
                }
                break;
        }
    }
}

export default ResourceICUPluralTranslation;