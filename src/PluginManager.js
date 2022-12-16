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

import path from 'node:path';
import log4js from 'log4js';

import FormatterManager from './FormatterManager.js';
import ParserManager from './ParserManager.js';
import RuleSet from './RuleSet.js';
import XliffPlugin from './plugins/XliffPlugin.js';
import AnsiConsoleFormatter from './formatters/AnsiConsoleFormatter.js';
import ResourceICUPlurals from './rules/ResourceICUPlurals.js';
import ResourceQuoteStyle from './rules/ResourceQuoteStyle.js';
import ResourceRegExpChecker from './rules/ResourceRegExpChecker.js';

var logger = log4js.getLogger("i18nlint.PluginManager");

const regexRules = {
    url: {
        name: "resource-url-match",
        description: "Ensure that URLs that appear in the source string are also used in the translated string",
        note: "URL '{matchString}' from the source string does not appear in the target string",
        regexps: [ "((https?|github|ftps?|mailto|file|data|irc):\\/\\/)([\\da-zA-Z\\.-]+)\\.([a-zA-Z\\.]{2,6})([\\/\w\\.-]*)*\\/?" ]
    },
    namedParams: {
        name: "resource-named-params",
        description: "Ensure that named parameters that appear in the source string are also used in the translated string",
        note: "The named parameter '{matchString}' from the source string does not appear in the target string",
        regexps: [ "\\{\\w+\\}" ]
    }
};

/**
 * @private
 */
function attemptLoad(name) {
    logger.trace(`Trying module ${name}`);
    return import(name);
};

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
function loadPlugin(name, API) {
    let promise = attemptLoad(name).catch(e1 => {
        const name2 = `i18nlint-${name}`;
        return attemptLoad(name2).catch(e2 => {
            const name3 = path.join(process.cwd(), "node_modules", name);
            return attemptLoad(name3).catch(e3 => {
                const name4 = path.join(process.cwd(), "node_modules", `i18nlint-${name}`);
                return attemptLoad(name4).catch(e4 => {
                    const name5 = path.join(process.cwd(), "..", "plugins", name + ".js")
                    return attemptLoad(name5).catch(e5 => {
                        // on the last attempt, don't catch the exception. Just let it
                        // go to the overall `catch` clause below.
                        const name6 = path.join(process.cwd(), "..", "plugins", `i18nlint-${name}` + ".js")
                        return attemptLoad(name6);
                    });
                });
            });
        });
    }).then((module) => {
        plugin = new module(API);
        plugin.init();
        return plugin;
    }).catch(e2 => {
        logger.trace(`Could not load plugin ${plugin}`);
        return undefined;
    });
};

function getAPI() {
    return {
        /**
         * Return the i18nlint's log4js logger so that the plugin can put its output into
         * the regular i18nlint stream.
         * @param {string} category the logger category to return
         * @returns {Logger} a logger instance
         */
        getLogger: function(category) {
            return log4js.getLogger(category);
        }
    };
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
        
        // default rules
        this.rules = new RuleSet([
            new ResourceICUPlurals(),
            new ResourceQuoteStyle(),
            new ResourceRegExpChecker(regexRules.url),
            new ResourceRegExpChecker(regexRules.namedParams)
        ]);

        // install the default formatter
        this.formatterMgr.add(AnsiConsoleFormatter); 
        // install the default parser, rules
        this.add(new XliffPlugin());
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
        this.parserMgr.add(plugin.getParsers());
        this.formatterMgr.add(plugin.getFormatters());
        this.rules.add(plugin.getRules());
    }

    /**
     * Load the named plugin.
     *
     * @param {String} name plugin to load
     * @returns {Promise} a promise to load the named plugin.
     * @accept {Plugin} the loaded plugin
     * @reject the plugin could not be found or loaded
     */
    load(name) {
        const API = getAPI();
        return loadPlugin(name, API).then((plugin) => {
            this.add(plugin);
        });
    }
};

export default PluginManager;
