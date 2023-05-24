#!/usr/bin/env node
/*
 * index.js - main program of ilib-lint
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

import OptionsParser from 'options-parser';
import Locale from 'ilib-locale';
import { JSUtils, Utils, Path } from 'ilib-common';
import json5 from 'json5';
import log4js from 'log4js';

import PluginManager from './PluginManager.js';
import Project from './Project.js';
import { wrap, indent } from './rules/utils.js';

const __dirname = Path.dirname(Path.fileUriToPath(import.meta.url));
log4js.configure(path.join(__dirname, '..', 'log4js.json'));

const logger = log4js.getLogger("ilib-lint.root");

// make sure the mins and maxes are numeric
function validateInt(paramName, arg, replace) {
    const num = parseInt(arg);
    if (!isNaN(num)) {
        replace(num);
        return true;
    }
    return `Argument to parameter ${paramName} must be an integer.`;
}

const optionConfig = {
    help: {
        short: "h",
        help: "This help message",
        showHelp: {
            banner: 'Usage: ilib-lint [-h] [options] path [path ...]',
            output: logger.info.bind(logger)
        }
    },
    config: {
        short: "c",
        varName: "PATH",
        help: "Give an explicit path to a configuration file instead of trying to find it in the current directory."
    },
    errorsOnly: {
        short: "e",
        flag: true,
        "default": false,
        help: "Only return errors and supress warnings"
    },
    formatter: {
        short: "f",
        varName: "NAME",
        "default": "ansi-console-formatter",
        help: "Name the formatter that should be used to format the output."
    },
    list: {
        flag: true,
        help: "Load all plugins, and then list out all available parsers, rules, rulesets, and formatters, then exit."
    },
    locales: {
        short: "l",
        varName: "LOCALES",
        "default": "en-AU,en-CA,en-GB,en-IN,en-NG,en-PH,en-PK,en-US,en-ZA,de-DE,fr-CA,fr-FR,es-AR,es-ES,es-MX,id-ID,it-IT,ja-JP,ko-KR,pt-BR,ru-RU,tr-TR,vi-VN,zxx-XX,zh-Hans-CN,zh-Hant-HK,zh-Hant-TW,zh-Hans-SG",
        help: "Locales you want your app to support. Value is a comma-separated list of BCP-47 style locale tags. Default: the top 20 locales on the internet by traffic."
    },
    sourceLocale: {
        short: "s",
        "default": "en-US",
        help: "Default locale used to interpret the strings in the source code or the source strings in resource files."
    },
    quiet: {
        short: "q",
        flag: true,
        help: "Produce no progress output during the run, except for error messages. Instead exit with a return value. Zero indicates no errors, and a positive exit value indicates errors."
    },
    verbose: {
        short: "v",
        flag: true,
        help: "Produce lots of progress output during the run."
    },
    fix: {
        flag: true,
        "default": false,
        help: "If auto-fixes are available for some of the errors, apply them (overwriting the original file)."
    },
    "max-errors": {
        short: "me",
        varName: "NUMBER",
        help: "Give the maximum acceptable number of errors allowed in this run. Default: 0",
        type: validateInt.bind(null, "max-errors")
    },
    "max-warnings": {
        short: "mw",
        varName: "NUMBER",
        help: "Give the maximum acceptable number of warnings allowed in this run. Default: 0",
        type: validateInt.bind(null, "max-warnings")
    },
    "max-suggestions": {
        short: "ms",
        varName: "NUMBER",
        help: "Give the maximum acceptable number of suggestions allowed in this run. Default: no maximum",
        type: validateInt.bind(null, "max-suggestions")
    },
    "min-score": {
        varName: "NUMBER",
        help: "Give the minimum acceptable I18N score allowed in this run. Valid values are 0-100. Default: no minimum",
        type: validateInt.bind(null, "min-score")
    }
};

const options = OptionsParser.parse(optionConfig);

/*
if (options.args.length < 1) {
    logger.info("Error: missing path parameter");
    OptionsParser.help(optionConfig, {
        banner: 'Usage: iilib-lint [-h] [options] path [path ...]',
        output: logger.info
    });
    process.exit(1);
}
*/

if (options.opt.quiet) {
    const rootlogger = log4js.getLogger();
    logger.level = "error";
} else if (options.opt.verbose) {
    const rootlogger = log4js.getLogger();
    logger.level = "debug";
}

logger.info("ilib-lint - Copyright (c) 2022-2023 JEDLsoft, All rights reserved.");

let paths = options.args;
if (paths.length === 0) {
    paths.push(".");
}

if (options.opt.locales) {
    options.opt.locales = options.opt.locales.split(/,/g);
}
// normalize the locale specs
options.opt.locales = options.opt.locales.map(spec => {
    let loc = new Locale(spec);
    if (!loc.getLanguage()) {
        loc = new Locale("und", loc.getRegion(), loc.getVariant(), loc.getScript());
    }
    return loc.getSpec();
});

// used if no explicit config is found or given
const defaultConfig = {
    "name": "ilib-lint",
    // top 27 locales on the internet by volume
    "locales": [
        "en-AU", "en-CA", "en-GB", "en-IN", "en-NG", "en-PH",
        "en-PK", "en-US", "en-ZA", "de-DE", "fr-CA", "fr-FR",
        "es-AR", "es-ES", "es-MX", "id-ID", "it-IT", "ja-JP",
        "ko-KR", "pt-BR", "ru-RU", "tr-TR", "vi-VN",
        "zh-Hans-CN", "zh-Hant-HK", "zh-Hant-TW", "zh-Hans-SG"
    ],
    "fileTypes": {
        "xliff": {
            "ruleset": "resource-check-all"
        }
    },
    "paths": {
        "**/*.xliff": "xliff"
    },
    "excludes": [
        "**/.git",
        "**/node_modules",
        "**/.svn",
        "package.json",
        "package-lock.json"
    ],
    "autofix": false
};

let config = {};
if (options.opt.config && !fs.existsSync(options.opt.config)) {
    logger.warn(`Config file ${options.opt.config} does not exist. Aborting...`);
    process.exit(2);
}
let configPath = options.opt.config || "./ilib-lint-config.json";
if (configPath && fs.existsSync(configPath)) {
    const data = fs.readFileSync(configPath, "utf-8");
    config = json5.parse(data);
} else {
    config = defaultConfig;
}

logger.debug(`Scanning input paths: ${JSON.stringify(paths)}`);

// loads and manage the plugins

const pluginMgr = new PluginManager({
    rulesData: config.rules,
    sourceLocale: options.opt.sourceLocale
});

const rootProject = new Project(".", {
    ...options,
    pluginManager: pluginMgr
}, config);

// this will load all the plugins, so we can print out the list of
// them below if needed
rootProject.init().then(() => {
    if (options.opt.list) {
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
    rootProject.scan(paths);
    const exitValue = rootProject.run();

    process.exit(exitValue);
}).catch(e => {
    logger.error(e);
});