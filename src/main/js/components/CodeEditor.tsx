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

import React, { Component } from "react";
import { Loading, ErrorNotification } from "@scm-manager/ui-components";
import { WithTranslation, withTranslation } from "react-i18next";

import AceEditor from "react-ace";
import "./EditorTheme.js";
import findLanguage from "./findLanguage";
import styled from "styled-components";

const defaultLanguage = "text";

type OnBlurCallbacks = {
  esc: () => void;
  strgEnter: () => void;
};

type Props = WithTranslation & {
  content?: string;
  language: string;
  disabled?: boolean;
  className?: string;
  initialFocus?: boolean;
  onChange: (value: string) => void;
  onBlur?: OnBlurCallbacks;
};

type State = {
  loading?: boolean;
  error?: Error;
  language?: string;
};

const StyledAceEditor = styled(AceEditor)`
  resize: vertical;
  min-height: 500px;
`;

class CodeEditor extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      language: defaultLanguage
    };
  }

  getLanguage = () => {
    const { language } = this.props;
    return findLanguage(language);
  };

  // disabled for now, code splitting seems not work for plugins
  componentDidMount() {
    this.loadLanguage();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    if (prevProps.language !== this.props.language) {
      this.loadLanguage();
    }
  }

  loadLanguage = () => {
    const language = this.getLanguage();
    this.setState({
      loading: true,
      error: undefined
    });
    import(`ace-builds/src-noconflict/mode-${language}`)
      .then(() => {
        this.setState({
          loading: false,
          error: undefined,
          language
        });
      })
      .catch(error => {
        this.setState({
          loading: false,
          error,
          language: defaultLanguage
        });
      });
  };

  reloadEditor = (editor: Ace.Editor) => {
    editor.resize(true);
    editor.renderer.updateFull(true);
  };

  render() {
    const { content, disabled, className, onChange, initialFocus = false, t } = this.props;
    const { language, loading, error } = this.state;

    if (loading) {
      return <Loading />;
    } else if (error) {
      return <ErrorNotification error={error} />;
    }

    return (
      <StyledAceEditor
        className={`is-family-monospace ${className}`}
        mode={language}
        theme="scm-manager"
        onChange={onChange}
        name="UNIQUE_ID_OF_DIV"
        value={content}
        readOnly={disabled}
        width="100%"
        fontSize="14px"
        onFocus={(event, editor: Ace.Editor) => this.reloadEditor(editor)}
        onScroll={(editor: Ace.Editor) => this.reloadEditor(editor)}
        setOptions={{ useWorker: false, cursorStyle: "smooth", autoScrollEditorIntoView: true }}
        placeholder={t("scm-editor-plugin.edit.placeholder")}
        focus={initialFocus}
        navigateToFileEnd={false}
        commands={[
          {
            name: "ToCommitMessage",
            bindKey: { mac: "Command-Enter", win: "Ctrl-Enter" },
            exec: editor => {
              editor.blur();
              this.props.onBlur?.strgEnter();
            }
          },
          {
            name: "ToCancelButton",
            bindKey: { mac: "Esc", win: "Esc" },
            exec: editor => {
              editor.blur();
              this.props.onBlur?.esc();
            }
          }
        ]}
      />
    );
  }
}

export default withTranslation("plugins")(CodeEditor);
