/*
 * ResourceCompleteness.js - rule to check that a resource has both source and target elements
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

import { Rule, Result } from "i18nlint-common";

/** Rule to check that a resource has both source and target elements */
class ResourceCompleteness extends Rule {
    /** @readonly */ name = "resource-completeness";
    /** @readonly */ description = "Ensure that resources are complete, i.e. have both source and target elements.";
    /** @readonly */ link = "https://github.com/ilib-js/i18nlint/blob/main/docs/resource-completeness.md";
    /** @readonly */ ruleType = "resource";

    constructor() {
        super({});
    }

    /** @override */
    getRuleType() {
        return this.ruleType;
    }

    /** Check that a given resource has both source and target tags set
     * @override
     * @param {object} options
     * @param {import("ilib-tools-common").Resource} options.resource
     * @param {string} options.file
     * @param {string} options.locale
     *
     */
    match({ resource, file, locale }) {
        const elements = {
            source: resource.getSource(),
            target: resource.getTarget(),
        };

        const elementsExist = Object.entries(elements).map(([name, value]) => ({
            name,
            exists: value !== undefined,
        }));

        if (elementsExist.some((el) => !el.exists)) {
            return new Result({
                severity: "error",
                id: resource.getKey(),
                rule: this,
                pathName: file,
                source: elements.source,
                locale,
                highlight: `The following elements are missing in the resource: <e0>${elementsExist
                    .filter((el) => !el.exists)
                    .map((el) => el.name)
                    .join(", ")}</e0>`,
                description: "Resource must have both source and target element defined"
            });
        } else return /* no error*/;
    }
}

export default ResourceCompleteness;
