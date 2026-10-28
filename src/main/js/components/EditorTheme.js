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
// copy of ace/theme/arduino-tomorrow
import css from '!!raw-loader!./EditorTheme.css';

export function registerTheme(ace) {
  ace.define(
    "ace/theme/scm-manager",
    ["require", "exports", "module", "ace/lib/dom"],
    function (require, exports, module) {
      exports.isDark = false;
      exports.cssClass = "ace-scm-manager";
      exports.cssText = css;
      var dom = require("ace/lib/dom");
      dom.importCssString(exports.cssText, exports.cssClass);
    }
  );
  ace.require("ace/theme/scm-manager");
}
