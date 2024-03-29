/*
 * MIT License
 *
 * Copyright (c) 2020-present Cloudogu GmbH and Contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
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
