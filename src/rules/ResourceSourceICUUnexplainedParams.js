/*
 * ResourceSourceICUUnexplainedParams.js
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

import { Result } from "i18nlint-common";
import { Resource } from "ilib-tools-common";
import ResourceRule from "./ResourceRule.js";
import Locale from "ilib-locale";
import { IntlMessageFormat } from "intl-messageformat";
import log4js from "log4js";

// type imports
/** @ignore @typedef {import("@formatjs/icu-messageformat-parser").MessageFormatElement} MessageFormatElement */
/** @ignore @typedef {import("@formatjs/icu-messageformat-parser").ArgumentElement} ArgumentElement */
/** @ignore @typedef {import("./ResourceSourceICUPluralCategories.js").Location} Location */

const logger = log4js.getLogger("i18nlint.ResourceSourceICUUnexplainedParams");

/**
 * Check if replacement parameters mentioned in the English source string are
 * mentioned in the description field as well. Translators can do a much better
 * job of translating if they know what each replacement parameter represents.
 */
export class ResourceSourceICUUnexplainedParams extends ResourceRule {
    /** @override */
    name = "source-icu-unexplained-params";
    /** @override */
    description =
        "Check if replacement parameters used in the source string are explained in the comments for translators.";
    /** @override */
    link =
        "https://github.com/ilib-js/i18nlint/blob/main/docs/source-icu-unexplained-params.md";

    /** @param {any} [opts] */
    constructor(opts) {
        super(opts);
    }

    /**
     * @param {Object} params
     * @param {string | undefined} params.source
     * @param {Resource} params.resource
     * @param {string} params.file
     * @returns {Result[] | undefined}
     * @override
     */
    matchString({ source, resource, file }) {
        if (!source) return; // no source, no checks needed

        const sourceLocale = new Locale(
            resource.getSourceLocale() ?? this.sourceLocale
        ).getSpec();

        const resourceComment = resource.getComment();
        if (!resourceComment) return; // no description provided, nothing to search

        // attempt to parse the source string as IntlMessage and output any encountered errors
        let ast;
        try {
            ast = new IntlMessageFormat(source, sourceLocale, undefined, {
                captureLocation: true
            }).getAst();
        } catch (e) {
            // this rule does not report on syntax errors in the source. Other rules do that,
            // so we can ignore this exception
            logger.debug(e);
            return;
        }

        // find all replacement parameters
        const /** @type {ArgumentElement[]} */ replacementParameters = [];
        this.traverseIcuAst(ast, (element) => {
            if (element.type === 1 /* argument */) {
                replacementParameters.push(element);
            }
        });

        // flag any replacement parameter whose label
        // does not appear in the description of the resource
        const missing = replacementParameters.filter((param) =>
            !resourceComment.includes(param.value)
        );

        return missing.map(
            (param) =>
                new Result({
                    rule: this,
                    id: resource.getKey(),
                    pathName: resource.getPath(),
                    source: source,
                    severity: "warning",
                    description: `Replacement parameter "${param.value}" is not mentioned in the string's comment for translators.`,
                    highlight: this.highlightLocation(source, param.location)
                })
        );
    }

    /**
     * Recursively traverse ICU Message
     *
     * @private
     */
    traverseIcuAst(
        /** @type {MessageFormatElement[]} */ elements,
        /** @type {(element: MessageFormatElement) => void} */ callback
    ) {
        for (const element of elements) {
            callback(element);
            switch (element.type) {
                case 5: // select
                case 6: // plural
                    this.traverseIcuAst(
                        Object.values(element.options).flatMap(
                            (option) => option.value
                        )
                    );
                    break;
                case 8: // tag
                    this.traverseIcuAst(element.children);
                    break;
            }
        }
    }

    /** @private */
    highlightLocation(
        /** @type {string} */ source,
        /** @type {Location | undefined} */ location
    ) {
        if (!location) {
            return `<e0>${source}</e0>`;
        }
        return (
            `${source.substring(0, location.start.offset)}` +
            `<e0>${source.substring(
                location.start.offset,
                location.end.offset
            )}</e0>` +
            `${source.substring(location.end.offset)}`
        );
    }
}

export default ResourceSourceICUUnexplainedParams;
