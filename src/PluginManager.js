/*
 * PluginManager.js - Load a list of plugins and maintain them
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

import fs from 'node:fs';
import path from 'node:path';
import log4js from 'log4js';

import FormatterManager from './FormatterManager.js';
import ParserManager from './ParserManager.js';
import RuleManager from './RuleManager.js';
import RuleSet from './RuleSet.js';
import BuiltinPlugin from './plugins/BuiltinPlugin.js';
import FixerManager from './FixerManager.js';

const logger = log4js.getLogger("i18nlint.PluginManager");

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

        if (options) {
            if (options.rulesData) {
                this.ruleMgr.add(options.rulesData);
            }
            if (options.rulesets) {
                this.ruleMgr.addRuleSetDefinitions(options.rulesets);
            }
        }

        // install the default parsers, rules, formatters, etc.
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
        this.fixerMgr.add(plugin.getFixers());
    }

    /**
     * Load the named plugin or plugins. If the names param is given
     * as a string, a single plugin is loaded. If it is an array of strings,
     * each named plugin is loaded. This method returns Promise
     *
     * @param {String|Array.<String>} names name or names of plugins to load
     * @returns {Promise} a promise to load the named plugins.
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
