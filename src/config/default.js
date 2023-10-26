/** @ignore @typedef {import("./Configuration.js").Configuration} Configuration */

export const /** @type {Configuration} */ defaultConfiguration = {
        name: "ilib-lint",
        // top 27 locales on the internet by volume
        locales: [
            "en-AU",
            "en-CA",
            "en-GB",
            "en-IN",
            "en-NG",
            "en-PH",
            "en-PK",
            "en-US",
            "en-ZA",
            "de-DE",
            "fr-CA",
            "fr-FR",
            "es-AR",
            "es-ES",
            "es-MX",
            "id-ID",
            "it-IT",
            "ja-JP",
            "ko-KR",
            "pt-BR",
            "ru-RU",
            "tr-TR",
            "vi-VN",
            "zh-Hans-CN",
            "zh-Hant-HK",
            "zh-Hant-TW",
            "zh-Hans-SG"
        ],
        filetypes: {
            // @ts-ignore TODO fix missing required property "template"
            xliff: {
                ruleset: "resource-check-all"
            }
        },
        paths: {
            "**/*.xliff": "xliff"
        },
        excludes: [
            "**/.git",
            "**/node_modules",
            "**/.svn",
            "package.json",
            "package-lock.json"
        ],
        autofix: false
    };

export default defaultConfiguration;
