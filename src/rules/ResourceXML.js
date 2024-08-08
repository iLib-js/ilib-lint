/*
 * ResourceXML.js - rule to check that XML in the translations match
 * XML in the source
 *
 * Copyright © 2024 JEDLSoft
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

import { Result } from 'ilib-lint-common';
import { xml2js } from 'xml-js';
import { selfClosingTags } from 'ilib-tools-common';
import ResourceRule from './ResourceRule.js';

const unnamedTagRe = /<\/?>/g;

/**
 * @class Represent an ilib-lint rule.
 */
class ResourceXML extends ResourceRule {
    /**
     * Make a new rule instance.
     * @constructor
     */
    constructor(options) {
        super(options);
        this.name = "resource-xml";
        this.description = "Ensure that XML in translated resources match the source";
        this.sourceLocale = (options && options.sourceLocale) || "en-US";
        this.link = "https://gihub.com/ilib-js/ilib-lint/blob/main/docs/resource-xml.md";

        const htmlTags = Object.keys(selfClosingTags).concat("p");
        this.selfClosingRe = new RegExp(`<(${htmlTags.join('|')})>`, "g");
        this.endTagRe = new RegExp(`</(${htmlTags.join('|')})>`, "g");
    }

    countElements(node, elements) {
        if (Array.isArray(node)) {
            for (let i in node) {
                this.countElements(node[i], elements);
            }
        } else {
            if (node.type === "element") {
                if (!elements[node.name]) {
                    elements[node.name] = 1;
                } else {
                    elements[node.name]++;
                }
            }
            if (node.elements) {
                this.countElements(node.elements, elements);
            }
        }
    }

    matchElements(sourceAst, targetAst, resource) {
        // first traverse the source tree looking for elements to count
        let sourceElements = {}, targetElements = {};
        let problems = [];

        if (sourceAst?.elements?.length > 0) {
            this.countElements(sourceAst?.elements, sourceElements);
            if (targetAst?.elements?.length > 0) {
                this.countElements(targetAst?.elements, targetElements);
            }

            for (let element in sourceElements) {
                if (!targetElements[element] || sourceElements[element] !== targetElements[element]) {
                    let opts = {
                        severity: "error",
                        rule: this,
                        description: `The number of XML <${element}> elements in the target (${targetElements[element] ?? 0}) does not match the number in the source (${sourceElements[element]}).`,
                        id: resource.getKey(),
                        highlight: `Target: ${resource.getTarget()}<e0/>`,
                        pathName: resource.getPath(),
                        source: resource.getSource(),
                        locale: resource.getTargetLocale()
                    };
                    problems.push(new Result(opts));
                }
            }

            for (let element in targetElements) {
                if (!sourceElements[element]) {
                    const re = new RegExp(`<(?<tag>\/?${element}\/?)>`, "g");
                    const highlight =
                        resource.getTarget().replace(re, "<e0>&lt;$<tag>></e0>");
                    let opts = {
                        severity: "error",
                        rule: this,
                        description: `The XML element <${element}> in the target does not appear in the source.`,
                        id: resource.getKey(),
                        highlight: `Target: ${highlight}`,
                        pathName: resource.getPath(),
                        source: resource.getSource(),
                        locale: resource.getTargetLocale()
                    };
                    problems.push(new Result(opts));
                }
            }
        }

        return problems;
    }

    matchString({source, target, file, resource}) {
        if (!target) return; // can't check "nothing" !
        let srcObj, tgtObj, match;
        let problems = [];
        const prefix = '<?xml version="1.0" encoding="UTF-8"?><root>';
        const suffix = '</root>';

        // convert HTML single tags like <p> to <p/> and <br> to <br/> so
        // that the xml parser doesn't freak out. But, we should only do
        // this if the closing tags </p> and </br> do not already exist
        // in the string
        this.endTagRe.lastIndex = 0;
        this.selfClosingRe.lastIndex = 0;
        if (!this.endTagRe.test(source)) {
            source = source.replace(this.selfClosingRe, "<$1/>");
        }
        const wrappedSource = `${prefix}${source}${suffix}`;

        try {
            srcObj = xml2js(wrappedSource, {
                trim: false
            });
        } catch (e) {
            // source is not well-formed, so don't even
            // attempt to parse the target!
            return undefined;
        }

        unnamedTagRe.lastIndex = 0;
        if ((match = unnamedTagRe.exec(target)) !== null) {
            const highlight =
                target.replace(/</g, "&lt;").replace(/(&lt;\/?>)/g, "<e0>$1</e0>");
            let opts = {
                severity: "error",
                rule: this,
                description: `Empty XML elements <> and </> are not allowed in the target.`,
                id: resource.getKey(),
                highlight: `Target: ${highlight}`,
                pathName: resource.getPath(),
                source: resource.getSource(),
                locale: resource.getTargetLocale()
            };
            problems.push(new Result(opts));
        }

        this.endTagRe.lastIndex = 0;
        this.selfClosingRe.lastIndex = 0;
        if (!this.endTagRe.test(target)) {
            target = target.replace(this.selfClosingRe, "<$1/>");
        }
        const wrappedTarget = `${prefix}${target}${suffix}`;
        try {
            // then parse the target
            tgtObj = xml2js(wrappedTarget, {
                trim: false
            });

            problems = problems.concat(this.matchElements(srcObj, tgtObj, resource));
        } catch (e) {
            const lines = e.message.split(/\n/g);
            // find the column number in the 3rd line of the exception message and subtract off
            // the length of the prefix text we added in wrappedTarget
            const column = parseInt(lines[2].substring(8)) - prefix.length;
            // create the highlight, but make sure to escape any less than characters so that
            // it does not conflict with the highlight
            const highlight = column >= target.length ?
                target.replace(/</g, "&lt;") + '<e0/>' :
                target.substring(0, column).replace(/</g, "&lt;") + '<e0>' + target[column] + '</e0>' + target.substring(column+1).replace(/</g, "&lt;");
            let opts = {
                severity: "error",
                rule: this,
                description: `XML in translation is not well-formed. Error: ${lines[0]}`,
                id: resource.getKey(),
                highlight: `Target: ${highlight}`,
                pathName: resource.getPath(),
                source: resource.getSource(),
                locale: resource.getTargetLocale()
            };
            problems.push(new Result(opts));
        }

        return problems.length < 2 ? problems[0] : problems;
    }
}

export default ResourceXML;