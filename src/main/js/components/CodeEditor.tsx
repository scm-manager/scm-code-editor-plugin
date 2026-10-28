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

import React, { FC, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";

import AceEditor from "react-ace";
import "./EditorTheme.js";
import findLanguage from "./findLanguage";
import styled from "styled-components";
import { registerTheme } from "./EditorTheme";
import * as ace from "ace-builds";
import { Ace } from "ace-builds";
import { useCodeSettingValue } from "./useProfile";
import { ErrorNotification, Loading } from "@scm-manager/ui-core";

const defaultLanguage = "text";

type OnBlurCallbacks = {
  esc: () => void;
  strgEnter: () => void;
};

type Props = {
  content?: string;
  language: string;
  disabled?: boolean;
  className?: string;
  initialFocus?: boolean;
  onChange: (value: string) => void;
  onBlur?: OnBlurCallbacks;
};

const StyledAceEditor = styled(AceEditor)`
  resize: vertical;
  min-height: 500px;
`;

const CodeEditor: FC<Props> = ({
                                 content,
                                 language: languageProp,
                                 disabled,
                                 className,
                                 initialFocus = false,
                                 onChange,
                                 onBlur
                               }) => {
  const { t } = useTranslation("plugins");
  const { value: codeSetting } = useCodeSettingValue();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [currentLanguage, setCurrentLanguage] = useState(defaultLanguage);

  useEffect(() => {
    const language = findLanguage(languageProp);
    setLoading(true);

    import(`ace-builds/src-noconflict/mode-${language}`)
      .then(() => {
        setCurrentLanguage(language);
        setError(undefined);
        setLoading(false);
      })
      .catch((err) => {
        setCurrentLanguage(defaultLanguage);
        setError(err);
        setLoading(false);
      });
  }, [languageProp]);

  const reloadEditor = useCallback((editor: Ace.Editor) => {
    const session = editor.getSession();
    session.setOptions({
      mode: "ace/mode/javascript",
      tabSize: codeSetting.tabSize,
      useSoftTabs: false
    });

    document.documentElement.style.setProperty(
      "--user-tab-size",
      String(codeSetting.tabSize)
    );

    editor.renderer.updateCharacterSize();
    editor.resize(true);
    editor.renderer.updateFull(true);
  }, [codeSetting.tabSize, content]);

  if (loading) {
    return <Loading />;
  } else if (error) {
    return <ErrorNotification error={error} />;
  }

  return (
    <StyledAceEditor
      className={`is-family-monospace ${className}`}
      mode={currentLanguage}
      onLoad={(editor) => {
        registerTheme(ace);
        editor.setTheme("ace/theme/scm-manager");
        reloadEditor(editor);
      }}
      theme="scm-manager"
      onChange={onChange}
      name="UNIQUE_ID_OF_DIV"
      value={content}
      readOnly={disabled}
      width="100%"
      fontSize="14px"
      onFocus={(event, editor) => {
        reloadEditor(editor as any);
      }}
      setOptions={{ useWorker: false, cursorStyle: "smooth", autoScrollEditorIntoView: true }}
      placeholder={t("scm-editor-plugin.edit.placeholder")}
      focus={initialFocus}
      navigateToFileEnd={false}
      commands={[
        {
          name: "ToCommitMessage",
          bindKey: { mac: "Command-Enter", win: "Ctrl-Enter" },
          exec: (editor) => {
            editor.blur();
            onBlur?.strgEnter();
          }
        },
        {
          name: "ToCancelButton",
          bindKey: { mac: "Esc", win: "Esc" },
          exec: (editor) => {
            editor.blur();
            onBlur?.esc();
          }
        }
      ]}
    />
  );
};

export default CodeEditor;
