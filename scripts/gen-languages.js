/*
 * Copyright (c) 2020 - present Cloudogu GmbH
 *
 * This program is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see https://www.gnu.org/licenses/.
 */

// @ts-nocheck
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const modeDirectory = path.resolve(__dirname, "..", "node_modules", "ace-builds", "src-noconflict");
const targetFile = path.resolve(__dirname, "..", "src", "main", "js", "components", "languages.ts");

const modes = fs
  .readdirSync(modeDirectory)
  .filter(file => file.indexOf("mode-") === 0)
  .map(file => '"' + file.substring(5, file.length - 3) + '"')
  .join(",");

const content = prettier.format(`const languages = [${modes}]; export default languages;`);
fs.writeFileSync(targetFile, content);
