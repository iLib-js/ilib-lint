/*
 * PluginManager.js - Load a list of plugins and maintain them
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

import fs from 'node:fs';
import path from 'node:path';
import log4js from 'log4js';

import FormatterManager from './FormatterManager.js';
import ParserManager from './ParserManager.js';
import RuleManager from './RuleManager.js';
import RuleSet from './RuleSet.js';
import BuiltinPlugin from './plugins/BuiltinPlugin.js';
import AnsiConsoleFormatter from './formatters/AnsiConsoleFormatter.js';
import ResourceICUPlurals from './rules/ResourceICUPlurals.js';
import ResourceICUPluralTranslation from './rules/ResourceICUPluralTranslation.js';
import ResourceQuoteStyle from './rules/ResourceQuoteStyle.js';
import ResourceUniqueKeys from './rules/ResourceUniqueKeys.js';
import ResourceEdgeWhitespace from './rules/ResourceEdgeWhitespace.js';
import ResourceCompleteness from './rules/ResourceCompleteness.js';
import ResourceDNTTerms from './rules/ResourceDNTTerms.js';
import ResourceNoTranslation from './rules/ResourceNoTranslation.js';
import ResourceStateChecker from './rules/ResourceStateChecker.js';
import FixerManager from './FixerManager.js';

const logger = log4js.getLogger("i18nlint.PluginManager");

// built-in declarative rules
export const regexRules = [
    {
        type: "resource-matcher",
        name: "resource-url-match",
        description: "Ensure that URLs that appear in the source string are also used in the translated string",
        note: "URL '{matchString}' from the source string does not appear in the target string",
        regexps: [ "((https?|github|ftps?|mailto|file|data|irc):\\/\\/)([\\da-zA-Z\\.-]+)\\.([a-zA-Z\\.]{2,6})([\\/\w\\.-]*)*\\/?" ],
        link: "https://github.com/ilib-js/i18nlint/blob/main/docs/resource-url-match.md"
    },
    {
        type: "resource-matcher",
        name: "resource-named-params",
        description: "Ensure that named parameters that appear in the source string are also used in the translated string",
        note: "The named parameter '{matchString}' from the source string does not appear in the target string",
        regexps: [ "\\{\\w+\\}" ],
        link: "https://github.com/ilib-js/i18nlint/blob/main/docs/resource-named-params.md"
    },
    {
        type: "resource-target",
        name: "resource-no-fullwidth-latin",
        description: "Ensure that the target does not contain any full-width Latin characters.",
        note: "The full-width characters '{matchString}' are not allowed in the target string. Use ASCII letters instead.",
        regexps: [ "[\\uFF21-\\uFF3A\\uFF41-\\uFF5A]+" ],
        link: "https://github.com/ilib-js/i18nlint/blob/main/docs/resource-no-fullwidth.md"
    },
    {
        type: "resource-target",
        name: "resource-no-fullwidth-digits",
        description: "Ensure that the target does not contain any full-width digits.",
        note: "The full-width characters '{matchString}' are not allowed in the target string. Use ASCII digits instead.",
        regexps: [ "[\\uFF10-\\uFF19]+" ],
        link: "https://github.com/ilib-js/i18nlint/blob/main/docs/resource-no-fullwidth-digits.md"
    },
    {
        type: "resource-target",
        name: "resource-no-fullwidth-punctuation-subset",
        description: "Ensure that the target does not contain specific full-width punctuation: percent sign, question mark, or exclamation mark.",
        note: "The full-width characters '{matchString}' are not allowed in the target string. Use ASCII symbols instead.",
        regexps: [ "[\\uFF01\\uFF05\\uFF1F]+" ],
        link: "https://github.com/ilib-js/i18nlint/blob/main/docs/resource-no-fullwidth-punctuation-subset.md"
    },
        {
        type: "resource-target",
        name: "resource-no-space-between-double-and-single-byte-character",
        description: "Ensure that the target does not contain a space character between a double-byte and single-byte character.",
        note: "The space character is not allowed in the target string. Remove the space character.",
        regexps: [ "[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]\\s+[\\x00-\\xFF]|[\\x00-\\xFF]\\s+[\\u3040-\\u309F\\u30A0-\\u30FF\\u4E00-\\u9FAF]" ],
        link: "https://github.com/ilib-js/i18nlint/blob/main/docs/resource-no-space-between-double-and-single-byte-character.md",
        severity: "warning",
    },
    {
        type: "resource-target",
        name: "resource-no-halfwidth-kana-characters",
        description: "Ensure that the target does not contain half-width kana characters.",
        note: "The half-width kana characters are not allowed in the target string. Use full-width characters.",
        regexps: [ "[ｧ-ﾝﾞﾟ]+" ],
        link: "https://github.com/ilib-js/i18nlint/blob/main/docs/resource-no-halfwidth-kana-characters.md",
        severity: "warning",
    },
    {
        type: "resource-target",
        name: "resource-no-double-byte-space",
        description: "Ensure that the target does not contain double-byte space characters.",
        note: "Double-byte space characters should not be used in the target string. Use ASCII symbols instead.",
        // per https://en.wikipedia.org/wiki/Whitespace_character
        regexps: [ "[\\u1680\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u2028\\u2029\\u202F\\u205F\\u3000]+" ],
        link: "https://github.com/ilib-js/i18nlint/blob/main/docs/resource-no-double-byte-space.md",
        severity: "warning",
    },
    {
        type: "resource-target",
        name: "resource-no-space-with-fullwidth-punctuation",
        description: "Ensure that there is no whitespace adjacent to the fullwidth punctuation characters.",
        note: "There should be no space adjacent to fullwidth punctuation characters '{matchString}'. Remove it.",
        regexps: [ "(\\s+[\\u3001\\u3002\\u3008-\\u3011\\u3014-\\u301B]|[\\u3001\\u3002\\u3008-\\u3011\\u3014-\\u301B]\\s+)" ],
        link: "https://github.com/ilib-js/i18nlint/blob/main/docs/resource-no-space-with-fullwidth-punctuation.md",
        severity: "warning",
    },
];

// built-in ruleset that contains all the built-in rules
export const builtInRulesets = {
    generic: {
        // programmatic rules
        "resource-icu-plurals": true,
        "resource-quote-style": true,
        "resource-state-checker": true,
        "resource-unique-keys": true,
        "resource-edge-whitespace": true,
        "resource-completeness": true,
        "resource-no-translation": true,
        "resource-icu-plurals-translated": true,

        // declarative rules from above
        "resource-url-match": true,
        "resource-named-params": true,
        "resource-no-fullwidth-latin": true,
        "resource-no-fullwidth-digits": true,
        "resource-no-fullwidth-punctuation-subset": true,
        "resource-no-space-between-double-and-single-byte-character": true,
        "resource-no-halfwidth-kana-characters": true,
        "resource-no-double-byte-space": true,
        "resource-no-space-with-fullwidth-punctuation": true,
    }
};

/**
 * @private
 */
function attemptLoad(name) {
    logger.trace(`Trying module ${name}`);
    return import(name);
};

/**
 * Needed because node does not know how to load ES modules
 * from a path. (Even though that is what it does when you
 * just name the module without a path. Sigh.)
 *
 * @private
 */
function attemptLoadPath(name) {
    logger.trace(`Trying directory module ${name}`);
    let packagePath = name;
    const packageName = path.join(name, "package.json");
    if (fs.existsSync(name) && fs.existsSync(packageName)) {
        const data = fs.readFileSync(packageName, "utf-8");
        const json = JSON.parse(data);
        if (json.type === "module") {
            let relativePath = json.module;
            if (!relativePath && json.exports) {
                const keys = Object.keys(json.exports);
                relativePath = keys.length && json.exports[keys[0]].import;
            }
            if (relativePath) {
                packagePath = path.join(name, relativePath);
            }
        }
    }
    logger.trace(`Path to this module is ${packagePath}`);
    return import(packagePath);
}

/*
 * Attempt to load the plugin in various places:
 *
 * - from the node_modules where i18nlint was loaded
 * - from the current directory's node_modules
 * - from the plugins directory one directory up
 *
 * Each time it attempts to load it, it will try two ways:
 *
 * - As-is. Maybe it is a fully specified package name?
 * - With the "i18nlint-" prefix. Try again except with
 * the prefix. This allows the users to configure plugins
 * in the config file more tersely, similar to the way
 * babel plugins can be named with only the unique part.
 *
 * @private
 */
function loadPlugin(name) {
    return attemptLoad(name).catch(e1 => {
        logger.trace(e1);
        const name2 = `ilib-lint-${name}`;
        return attemptLoad(name2).catch(e2 => {
            logger.trace(e2);
            const name3 = path.join(process.cwd(), "node_modules", name);
            return attemptLoadPath(name3).catch(e3 => {
                logger.trace(e3);
                const name4 = path.join(process.cwd(), "node_modules", `ilib-lint-${name}`);
                return attemptLoadPath(name4).catch(e4 => {
                    logger.trace(e4);
                    const name5 = path.join(process.cwd(), "..", "plugins", name + ".js")
                    return attemptLoad(name5).catch(e5 => {
                        logger.trace(e5);
                        // on the last attempt, don't catch the exception. Just let it
                        // go to the overall `catch` clause below.
                        const name6 = path.join(process.cwd(), "..", "plugins", `ilib-lint-${name}` + ".js")
                        return attemptLoad(name6);
                    });
                });
            });
        });
    }).then((module) => {
        logger.trace(`Module ${name} successfully loaded.`);
        const Main = module.default;
        const plugin = new Main({
            getLogger: log4js.getLogger.bind(log4js)
        });
        plugin.init();
        return plugin;
    }).catch(e2 => {
        logger.error(`Could not load plugin ${name}`);
        logger.trace(e2);
        return undefined;
    });
};

/**
 * @class Represent a plugin manager, which loads a list of plugins
 * and then maintains references to them
 */
class PluginManager {
    /**
     * Construct a new plugin manager.
     */
    constructor(options) {
        this.parserMgr = new ParserManager();
        this.formatterMgr = new FormatterManager();
        this.ruleMgr = new RuleManager();
        this.fixerMgr = new FixerManager();
        this.sourceLocale = options && options.sourceLocale;

        // default rules
        this.ruleMgr.add([
            ResourceICUPlurals,
            ResourceICUPluralTranslation,
            ResourceQuoteStyle,
            ResourceUniqueKeys,
            ResourceEdgeWhitespace,
            ResourceCompleteness,
            ResourceDNTTerms,
            ResourceNoTranslation,
            ResourceStateChecker
        ]);
        this.ruleMgr.add(regexRules);

        if (options) {
            if (options.rulesData) {
                this.ruleMgr.add(options.rulesData);
            }
            if (options.rulesets) {
                this.ruleMgr.addRuleSetDefinitions(options.rulesets);
            }
        }

        // add the default "generic" ruleset above
        this.ruleMgr.addRuleSetDefinitions(builtInRulesets);

        // install the default formatter
        this.formatterMgr.add(AnsiConsoleFormatter);

        // install the default parsers, rules, etc.
        this.add(new BuiltinPlugin({
            getLogger: log4js.getLogger.bind(log4js)
        }));
    }

    /**
     * Return the parser manager for this plugin manager.
     * This manages both the built-in parsers, and the parsers
     * loaded from the plugins.
     *
     * @returns {ParserManager} the parser manager for this
     * plugin manager.
     */
    getParserManager() {
        return this.parserMgr;
    }

    /**
     * Return the formatter manager for this plugin manager. This
     * manages both the built-in formatters, and the formatters
     * loaded from the plugins.
     *
     * @returns {FormatterManager} the formatter manager for this
     * plugin manager.
     */
    getFormatterManager() {
        return this.formatterMgr;
    }

    /**
     * Return the fixer manager for this plugin manager. This
     * manages both the built-in fixers, and the fixers
     * loaded from the plugins.
     *
     * @returns {FixerManager} the fixer manager for this
     * plugin manager.
     */
    getFixerManager() {
        return this.fixerMgr;
    }

    /**
     * Return the rule manager for this plugin manager. This
     * manages both the built-in rules, and the rules
     * loaded from the plugins.
     *
     * @returns {RuleManager} the rule manager for this
     * plugin manager.
     */
    getRuleManager() {
        return this.ruleMgr;
    }

    /**
     * Return the rules in this manager. This is from both the
     * built-in rules and the rules loaded from the plugins.
     *
     * @returns {FormatterManager} the rule set for this plugin manager.
     */
    getRuleSet() {
        return this.rules;
    }

    /**
     * Add the already-loaded plugin to this manager.
     *
     * @param {Plugin} a plugin to add
     */
    add(plugin) {
        if (!plugin) return;
        this.parserMgr.add(plugin.getParsers());
        this.formatterMgr.add(plugin.getFormatters());
        this.ruleMgr.add(plugin.getRules());
        this.ruleMgr.addRuleSetDefinitions(plugin.getRuleSets());
    }

    /**
     * Load the named plugin or plugins. If the names param is given
     * as a string, a single plugin is loaded. If it is an array of strings,
     * each named plugin is loaded. This method returns Promise
     *
     * @param {String|Array.<String>} names name or names of plugins to load
     * @returns {Promise<void>} a promise to load the named plugins.
     * @accept {Array.<Object>} an array of promise statuses. The status
     * field will either be "fulfilled" and the value field will be the
     * Plugin instance, or "rejected" and the reason field will be filled
     * with a description of why the plugin could not be loaded.
     * @reject the plugins could not be found or loaded
     */
    load(names) {
        if (typeof(name) === 'string') {
            names = [ names ];
        }
        return Promise.allSettled(names.map(name => {
            return loadPlugin(name).then((plugin) => {
                this.add(plugin);
            });
        }));
    }
};

export default PluginManager;
