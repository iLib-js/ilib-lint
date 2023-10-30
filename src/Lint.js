/*
 * lint.js - main program of ilib-lint that is runnable programmatically
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

import fs from 'node:fs';
import path from 'node:path';

import { Path } from 'ilib-common';
import log4js from 'log4js';

import PluginManager from './PluginManager.js';
import Project from './Project.js';
import { wrap, indent } from './rules/utils.js';

const __dirname = Path.dirname(Path.fileUriToPath(import.meta.url));
log4js.configure(path.join(__dirname, '..', 'log4js.json'));

/**
 * @class A linter that probes for internationalization problems.
 */
class Lint {
    /**
     * Construct a new linter instance. This class offers a programmatic interface to
     * run the whole linter. The command-line wrapper for "ilib-lint" simply collects and
     * parses its command-line arguments, creates an instance of this class, and then
     * runs it. Other programs can instantiate this class directly with options and
     * configuration to run the linter without spawning a new instance of node to do
     * it.
     *
     * @param options {Object} options controlling how this instance
     * of the linter will run
     * @param options.errorsOnly {Boolean} Only return errors and supress warnings
     * @param options.formatter {String} Name the formatter that should be used to format the output
     * @param options.list {Boolean} Load all plugins, and then list out all available parsers, rules,
     * rulesets, and formatters, then exit.
     * @param options.locales {String} Locales you want your app to support. Value is a comma-separated
     * list of BCP-47 style locale tags. Default: the top 20 locales on the internet by traffic.
     * @param options.sourceLocale {String} Default locale used to interpret the strings in the source
     * code or the source strings in resource files.
     * @param options.quiet {Boolean} Produce no progress output during the run, except for error
     * messages. Instead exit with a return value. Zero indicates no errors, and a positive exit
     * value indicates errors.
     * @param options.verbose {Boolean} Produce lots of progress output during the run
     * @param options.fix {Boolean} If auto-fixes are available for some of the errors, apply them
     * (overwriting the original file).
     * @param options.max-errors {Number} Give the maximum acceptable number of errors allowed in this
     * run. Default: 0
     * @param options.max-warnings {Number} Give the maximum acceptable number of warnings allowed in
     * this run. Default: 0
     * @param options.max-suggestions {Number} Give the maximum acceptable number of suggestions allowed
     * in this run. Default: no maximum
     * @param options.min-score {Number} Give the minimum acceptable I18N score allowed in this run. Valid
     * values are 0-100. Default: no minimum
     * @param options.root {String} path to the root of the project where the linter should start searching
     * for project files
     * @param config {Object} the contents of the ilib lint configuration file (or an in-memory
     * representation of it)
     * @param config.name {String} name of this lint project
     * @param config.plugins {Array.<String>} an array of names of
     * lint plugins to load
     * @param config.locales {Array.<String>} an array of locale
     * specs to use while running this linter. Only these locales
     * will be considered while evaluating the rules.
     * @param config.rules {Array.<Object>} an array of declarative
     * rule definitions. See the documentation for the
     * {@see RuleManager.js} for details.
     * @param config.rulesets {Object} an object which maps rule set
     * names to a ruleset definition. See the documentation for the
     * {@see RuleManager.js} for details.
     * @param config.filetypes {Object} an object which maps file
     * type names to file type definitions. See the documentation for the
     * {@see FileType.js} for details.
     * @param config.paths {Object} an object which maps glob expressions
     * to a file type or an anonymous file type definition
     */
    constructor(options, config) {
        this.logger = log4js.getLogger();
        if (options.quiet) {
            this.logger.level = "error";
        } else if (options.verbose) {
            this.logger.level = "debug";
        }

        this.options = options;
        this.config = config;

        if (!this.options.locales) {
            // default so we have something at least
            this.options = {
                ...this.options,
                locales: ["en-US"]
            };
        }
    }

    /**
     * Run the linter with the options and config that this instance was created with.
     *
     * @param {String} root path to the root of the project
     * @param {Array.<String>} paths an array of paths to search for files or projects to lint
     * @returns {Promise} a promise to run the linter
     * @accept {Number} the exit code for the run
     * @reject {Error} an error occurred while running the linter
     */
    async run(root, paths) {
        this.logger.info("ilib-lint - Copyright (c) 2022-2023 JEDLsoft, All rights reserved.");

        this.logger.debug(`Scanning input paths: ${JSON.stringify(paths)}`);

        // loads and manage the plugins

        const pluginMgr = new PluginManager({
            rulesData: this.config.rules,
            sourceLocale: this.options.sourceLocale
        });

        const rootProject = new Project(root, {
            ...this.options,
            pluginManager: pluginMgr
        }, this.config);

        // this will load all the plugins, so we can print out the list of
        // them below if needed
        try {
            await rootProject.init();
            if (this.options.list) {
                const ruleMgr = pluginMgr.getRuleManager();
                const ruleDescriptions = ruleMgr.getDescriptions();
                const ruleSetDefinitions = ruleMgr.getRuleSetDefinitions();
                const parserMgr = pluginMgr.getParserManager();
                const parserDescriptions = parserMgr.getDescriptions();
                const formatterMgr = pluginMgr.getFormatterManager();
                const formatterDescriptions = formatterMgr.getDescriptions();

                let name;

                let output = [
                    "These items are available to use in your configuration",
                    "",
                    "Parsers:"
                ];
                for (name in parserDescriptions) {
                    output = output.concat(indent(wrap(`${name} - ${parserDescriptions[name]}`, 76, "  "), 2));
                }
                output.push("");

                output.push("Rules:");
                for (name in ruleDescriptions) {
                    output = output.concat(indent(wrap(`${name} - ${ruleDescriptions[name]}`, 76, "  "), 2));
                }
                output.push("");

                output.push("Rulesets:");
                for (name in ruleSetDefinitions) {
                    output = output.concat(indent(wrap(`${name} - ${ruleSetDefinitions[name].join(", ")}`, 76, "  "), 2));
                }
                output.push("");

                output.push("Formatters:");
                for (name in formatterDescriptions) {
                    output = output.concat(indent(wrap(`${name} - ${formatterDescriptions[name]}`, 76, "  "), 2));
                }

                console.log(output.join('\n'));
                process.exit(0);
            }

            // main loop
            const fullPaths = paths.map(relativePath => path.join(root || ".", relativePath));
            await rootProject.scan(fullPaths);
            const exitValue = rootProject.run();

            return exitValue;
        } catch (e) {
            this.logger.error(e);
            return 2;
        }
    }
}

export default Lint;