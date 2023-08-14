var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@scom/scom-markdown-editor/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_1.Styles.Theme.ThemeVars;
    components_1.Styles.cssRule('i-scom-markdown-editor', {
        overflow: 'hidden',
        $nest: {
            'i-panel.container': {
                width: Theme.layout.container.width,
                maxWidth: Theme.layout.container.maxWidth,
                overflow: Theme.layout.container.overflow,
                textAlign: Theme.layout.container.textAlign,
                margin: '0 auto'
            },
            'a': {
                display: 'initial'
            },
            '.toastui-editor-dropdown-toolbar': {
                maxWidth: '100%',
                flexWrap: 'wrap',
                height: 'auto'
            },
            '.toastui-editor-mode-switch': {
                background: 'transparent'
            },
            ".toastui-editor-contents ul:has(li input[type='checkbox'])": {
                paddingLeft: 0,
            },
            ".toastui-editor-contents ul li:has(input[type='checkbox']):before": {
                content: "none",
            },
            ".toastui-editor-md-container": {
                backgroundColor: "transparent"
            },
            ".toastui-editor-ww-container": {
                backgroundColor: "transparent"
            }
        }
    });
});
define("@scom/scom-markdown-editor/store.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.getAIAPIKey = exports.getAIAPIUrl = exports.setDataFromSCConfig = void 0;
    ///<amd-module name='@scom/scom-markdown-editor/store.ts'/> 
    const state = {
        aiAPIUrl: '',
        aiAPIKey: '' //FIXME: for demo only, to be removed later
    };
    const setDataFromSCConfig = (options) => {
        if (options.aiAPIUrl) {
            state.aiAPIUrl = options.aiAPIUrl;
        }
        if (options.aiAPIUrl) {
            state.aiAPIKey = options.aiAPIKey;
        }
    };
    exports.setDataFromSCConfig = setDataFromSCConfig;
    const getAIAPIUrl = () => {
        return state.aiAPIUrl;
    };
    exports.getAIAPIUrl = getAIAPIUrl;
    const getAIAPIKey = () => {
        return state.aiAPIKey;
    };
    exports.getAIAPIKey = getAIAPIKey;
});
define("@scom/scom-markdown-editor/data.json.ts", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    ///<amd-module name='@scom/scom-markdown-editor/data.json.ts'/> 
    exports.default = {
        "aiAPIUrl": "https://api.openai.com/v1/completions",
        "aiAPIKey": "",
        "defaultBuilderData": {
            "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla ac est sit amet urna consectetur semper. Curabitur posuere justo et nibh gravida, non tristique urna fringilla. Vestibulum id velit sed nisl tincidunt aliquet. Morbi viverra sapien eu purus venenatis, vitae vestibulum odio bibendum. Fusce volutpat gravida velit, id efficitur erat luctus id. Nullam malesuada hendrerit orci, a pretium tortor facilisis non. Sed euismod euismod felis. Nunc rhoncus diam in mi placerat efficitur. Aenean pulvinar neque ac nisl consequat, non lacinia lectus dapibus. Phasellus sagittis sagittis massa a luctus. Etiam auctor semper ullamcorper. Suspendisse potenti."
        }
    };
});
define("@scom/scom-markdown-editor/API.ts", ["require", "exports", "@scom/scom-markdown-editor/store.ts"], function (require, exports, store_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.fetchAIGeneratedText = void 0;
    async function fetchAIGeneratedText(prompt) {
        const APIUrl = (0, store_1.getAIAPIUrl)();
        const APIKey = (0, store_1.getAIAPIKey)();
        const response = await fetch(APIUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'OpenAI/NodeJS/3.1.0',
                Authorization: `Bearer ${APIKey}`
            },
            body: JSON.stringify({
                "model": "text-davinci-003",
                "prompt": prompt,
                "temperature": 0.7,
                "max_tokens": 3000,
                "top_p": 1,
                "frequency_penalty": 0,
                "presence_penalty": 0,
                "stream": true
            })
        });
        // const result = await response.json();
        // const answer: string = result.choices[0]?.text?.replaceAll('\n', '');
        return response.body;
    }
    exports.fetchAIGeneratedText = fetchAIGeneratedText;
});
define("@scom/scom-markdown-editor/editor/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_2.Styles.Theme.ThemeVars;
    const typingAnim = components_2.Styles.keyframes({
        '0%': { "transform": "translate(0, -7px)" },
        '25%': { "transform": "translate(0, 0)" },
        '50%': { "transform": "translate(0, 0)" },
        '75%': { "transform": "translate(0, 0)" },
        '100%': { "transform": "translate(0, 7px)" }
    });
    components_2.Styles.cssRule('i-scom-markdown-editor-config', {
        $nest: {
            'i-panel.container': {
                width: Theme.layout.container.width,
                maxWidth: Theme.layout.container.maxWidth,
                overflow: Theme.layout.container.overflow,
                textAlign: Theme.layout.container.textAlign,
                margin: '0 auto'
            },
            '.typing': {
                transition: 'all 0.5s linear',
                $nest: {
                    'i-icon:nth-last-child(1)': {
                        animation: `${typingAnim} 1s 0.3s linear infinite`
                    },
                    'i-icon:nth-last-child(2)': {
                        animation: `${typingAnim} 1s 0.2s linear infinite`
                    },
                    'i-icon:nth-last-child(3)': {
                        animation: `${typingAnim} 1s 0.2s linear infinite`
                    }
                }
            },
            'a': {
                display: 'initial'
            },
            '.toastui-editor-dropdown-toolbar': {
                maxWidth: '100%',
                flexWrap: 'wrap',
                height: 'auto'
            },
        }
    });
});
define("@scom/scom-markdown-editor/editor/index.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-markdown-editor/API.ts", "@scom/scom-markdown-editor/editor/index.css.ts"], function (require, exports, components_3, API_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_3.Styles.Theme.ThemeVars;
    let Config = class Config extends components_3.Module {
        constructor() {
            super(...arguments);
            this._data = '';
            this._theme = 'light';
            this.isStopped = false;
            this.tag = {};
        }
        get content() {
            var _a;
            return ((_a = this.mdEditor) === null || _a === void 0 ? void 0 : _a.getMarkdownValue()) || this._data;
        }
        set content(value) {
            this._data = value;
            if (this.mdEditor)
                this.mdEditor.value = value;
        }
        get theme() {
            return this._theme;
        }
        set theme(value) {
            this._theme = value;
            if (this.mdEditor)
                this.mdEditor.theme = value;
        }
        getTag() {
            return this.tag;
        }
        async setTag(value) {
            const { background, textAlign } = value;
            this.tag = { background, textAlign };
            this.updateMardown();
        }
        updateMardown() {
            if (this.wrapPnl) {
                const { background, textAlign } = this.tag;
                this.wrapPnl.style.textAlign = textAlign || "left";
                this.wrapPnl.style.setProperty('--bg-container', background || '');
            }
        }
        async renderEditor() {
            if (!this.mdEditor) {
                this.mdEditor = await components_3.MarkdownEditor.create({
                    value: this._data,
                    mode: 'wysiwyg',
                    width: '100%',
                    height: 'auto',
                    theme: this.theme
                });
                this.mdEditor.display = 'block';
                this.pnlEditor.clearInnerHTML();
                this.pnlEditor.appendChild(this.mdEditor);
            }
            this.mdEditor.value = this._data;
            this.mdEditor.theme = this.theme;
            this.updateMardown();
        }
        toggleStopBtn(value) {
            this.btnStop.visible = value;
            this.btnSend.visible = !value;
            this.pnlWaiting.visible = value;
            this.inputAIPrompt.visible = !value;
        }
        async readAllChunks(readableStream) {
            var _a;
            const reader = readableStream.getReader();
            let done;
            let value;
            while (!done) {
                ;
                ({ value, done } = await reader.read());
                const valueString = new TextDecoder().decode(value);
                const lines = valueString.split('\n').filter((line) => line.trim() !== '');
                for (const line of lines) {
                    if (this.isStopped)
                        break;
                    const message = line.replace(/^data: /, '');
                    if (message === '[DONE]')
                        return;
                    try {
                        const parsedMessage = JSON.parse(message);
                        const text = parsedMessage.choices[0].text;
                        this.mdEditor.value = (((_a = this.mdEditor) === null || _a === void 0 ? void 0 : _a.getMarkdownValue()) || '') + text;
                    }
                    catch (error) {
                        console.error('Could not JSON parse stream message', message, error);
                    }
                }
            }
        }
        async sendAIPrompt() {
            this.isStopped = false;
            if (!this.inputAIPrompt.value)
                return;
            this.toggleStopBtn(true);
            try {
                const result = await (0, API_1.fetchAIGeneratedText)(this.inputAIPrompt.value);
                if (!this.isStopped)
                    await this.readAllChunks(result);
            }
            catch (_a) { }
            this.inputAIPrompt.value = '';
            this.toggleStopBtn(false);
        }
        async stopAPIPrompt() {
            this.isStopped = true;
            this.inputAIPrompt.value = '';
            this.toggleStopBtn(false);
        }
        init() {
            super.init();
            this.content = this.getAttribute('content', true, '');
            const themeAttr = this.getAttribute('theme', true);
            if (themeAttr)
                this.theme = themeAttr;
            const tag = this.getAttribute('tag', true);
            if (tag)
                this.setTag(tag);
            this.renderEditor();
        }
        render() {
            return (this.$render("i-panel", { id: "wrapPnl" },
                this.$render("i-panel", { id: 'pnlEditor' },
                    this.$render("i-markdown-editor", { id: "mdEditor", width: '100%', height: 'auto', mode: 'wysiwyg' })),
                this.$render("i-hstack", { id: 'pnlAIPrompt', visible: false, width: '100%', horizontalAlignment: 'space-between', verticalAlignment: 'center', padding: {
                        top: '0.5rem',
                        bottom: '0.5rem',
                        left: '1rem',
                        right: '1rem',
                    } },
                    this.$render("i-vstack", { width: '90%' },
                        this.$render("i-hstack", { id: 'pnlWaiting', gap: 4, verticalAlignment: 'center', minHeight: 32, width: '100%', height: 'auto', border: {
                                width: '0.5px',
                                style: 'solid',
                                color: Theme.divider,
                            }, background: { color: Theme.input.background }, padding: { left: '10px' }, visible: false },
                            this.$render("i-label", { font: { size: '1.5rem', color: Theme.input.fontColor }, caption: 'AI is writing' }),
                            this.$render("i-hstack", { gap: 4, verticalAlignment: 'center', class: 'typing' },
                                this.$render("i-icon", { name: 'circle', width: 4, height: 4, fill: Theme.input.fontColor }),
                                this.$render("i-icon", { name: 'circle', width: 4, height: 4, fill: Theme.input.fontColor }),
                                this.$render("i-icon", { name: 'circle', width: 4, height: 4, fill: Theme.input.fontColor }))),
                        this.$render("i-input", { id: 'inputAIPrompt', placeholder: 'Ask AI to edit or generate...', font: { size: '1.5rem' }, height: 'auto', width: '100%' })),
                    this.$render("i-button", { id: 'btnStop', caption: 'Stop', width: '10%', visible: false, font: { color: 'rgba(255,255,255)' }, padding: {
                            top: '0.5rem',
                            bottom: '0.5rem',
                            left: '1rem',
                            right: '1rem',
                        }, onClick: this.stopAPIPrompt }),
                    this.$render("i-button", { id: 'btnSend', caption: 'Send', width: '10%', font: { color: 'rgba(255,255,255)' }, padding: {
                            top: '0.5rem',
                            bottom: '0.5rem',
                            left: '1rem',
                            right: '1rem',
                        }, onClick: this.sendAIPrompt }))));
        }
    };
    Config = __decorate([
        components_3.customModule,
        (0, components_3.customElements)('i-scom-markdown-editor-config')
    ], Config);
    exports.default = Config;
});
define("@scom/scom-markdown-editor", ["require", "exports", "@ijstech/components", "@scom/scom-markdown-editor/store.ts", "@scom/scom-markdown-editor/data.json.ts", "@scom/scom-markdown-editor/editor/index.tsx", "@scom/scom-markdown-editor/index.css.ts"], function (require, exports, components_4, store_2, data_json_1, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_4.Styles.Theme.ThemeVars;
    const lightTheme = components_4.Styles.Theme.defaultTheme;
    const darkTheme = components_4.Styles.Theme.darkTheme;
    const LibPath = `libs/@scom/scom-markdown-editor/`;
    const TOOLBAR_ITEMS_DEFAULT = [
        ['heading', 'bold', 'italic', 'strike'],
        ['hr', 'quote'],
        ['ul', 'ol', 'task', 'indent', 'outdent'],
        ['table', 'image', 'link'],
        ['code', 'codeblock']
    ];
    const libPlugins = [
        `${LibPath}lib/tui-editor/toastui-editor-all.min.js`,
        `${LibPath}lib/tui-editor/toastui-editor-plugin-color-syntax.min.js`,
        `${LibPath}lib/tui-editor/toastui-editor-plugin-code-syntax-highlight-all.min.js`,
        `${LibPath}lib/tui-editor/toastui-editor-plugin-table-merged-cell.min.js`,
        `${LibPath}lib/tui-editor/toastui-editor-plugin-uml.min.js`,
    ];
    const editorCSS = [
        { name: 'toastui-editor', href: `${LibPath}lib/tui-editor/toastui-editor.min.css` },
        { name: 'toastui-plugins', href: `${LibPath}lib/tui-editor/toastui-plugins.min.css` },
    ];
    let ScomMarkdownEditor = class ScomMarkdownEditor extends components_4.Module {
        constructor(parent, options) {
            super(parent, options);
            this.tag = {};
            this.defaultEdit = true;
            this.editorPlugins = [];
            this._theme = 'light';
            this._inline = false;
            this.selectionTimer = null;
            this.commandHistory = null;
            this.selectionPos = {
                start: null,
                end: null
            };
            if (data_json_1.default)
                (0, store_2.setDataFromSCConfig)(data_json_1.default);
            this.onSelectionHandler = this.onSelectionHandler.bind(this);
        }
        static async create(options, parent) {
            let self = new this(parent, options);
            await self.ready();
            return self;
        }
        get data() {
            return this._data;
        }
        set data(value) {
            this._data = value;
            this.setData({ content: value });
        }
        get theme() {
            var _a;
            return (_a = this._theme) !== null && _a !== void 0 ? _a : 'light';
        }
        set theme(value) {
            var _a;
            this._theme = value !== null && value !== void 0 ? value : 'light';
            if (this.pnlMarkdownEditor && !((_a = this.tag) === null || _a === void 0 ? void 0 : _a.settingColor)) {
                this.tag.background = this.getBackgroundColor();
                this.pnlMarkdownEditor.background.color = this.tag.background;
            }
            if (this.mdViewer) {
                if (this.theme === 'light')
                    this.mdViewer.classList.remove('toastui-editor-dark');
                else
                    this.mdViewer.classList.add('toastui-editor-dark');
            }
            if (this.mdEditor) {
                if (this.theme === 'light')
                    this.mdEditor.classList.remove('toastui-editor-dark');
                else
                    this.mdEditor.classList.add('toastui-editor-dark');
            }
        }
        get inline() {
            var _a;
            return (_a = this._inline) !== null && _a !== void 0 ? _a : false;
        }
        set inline(value) {
            this._inline = value;
            if (this.inline && !this.mdEditor) {
                this.renderEditor();
            }
            this.pnlEditorWrap.visible = this.inline;
            if (this.inline) {
                this.classList.add('is-inline');
            }
            else {
                this.classList.remove('is-inline');
            }
        }
        setRootParent(parent) {
            this._rootParent = parent;
            const newTag = Object.assign(Object.assign({}, this.tag), { background: this.getBackgroundColor() });
            this.setTag(newTag);
        }
        getBackgroundColor() {
            let background = '';
            if (this._rootParent) {
                const rowStyles = window.getComputedStyle(this._rootParent, null);
                background = this._rootParent.background.color || (rowStyles === null || rowStyles === void 0 ? void 0 : rowStyles.backgroundColor);
            }
            return background || this.getDefaultThemeColor();
        }
        getDefaultThemeColor() {
            const bgByTheme = this.theme === 'light' ? lightTheme.background.main : darkTheme.background.main;
            return bgByTheme;
        }
        async initPlugins() {
            try {
                for (const item of editorCSS) {
                    this.addCSS(item.href, item.name);
                }
                await this.loadPlugins();
            }
            catch (_a) { }
        }
        addCSS(href, name) {
            const css = document.head.querySelector(`[name="${name}"]`);
            if (css)
                return;
            let link = document.createElement('link');
            link.setAttribute('type', 'text/css');
            link.setAttribute('rel', 'stylesheet');
            link.setAttribute('name', name);
            link.href = href;
            document.head.append(link);
        }
        renderEditor(init) {
            const editorPlugins = [...this.editorPlugins].filter(Boolean);
            this.pnlEditor.clearInnerHTML();
            const currentValue = this.data;
            this.mdEditor = new this.editor({
                el: this.pnlEditor,
                previewStyle: 'vertical',
                height: 'auto',
                viewer: true,
                initialEditType: 'wysiwyg',
                initialValue: currentValue,
                theme: this.theme,
                toolbarItems: TOOLBAR_ITEMS_DEFAULT,
                plugins: [...editorPlugins]
            });
            this.pnlEditor.visible = false;
            this.mdEditor.on('focus', () => {
                this.classList.add('is-focused');
            });
            this.mdEditor.on('blur', () => {
                this.classList.remove('is-focused');
            });
        }
        renderViewer() {
            if (this.mdViewer)
                return;
            const editorPlugins = [...this.editorPlugins].filter(Boolean);
            this.pnlViewer.clearInnerHTML();
            this.mdViewer = new this.editor.factory({
                el: this.pnlViewer,
                height: 'auto',
                viewer: true,
                initialValue: this.data,
                theme: this.theme,
                plugins: [...editorPlugins],
            });
        }
        async loadPlugin(plugin) {
            return new Promise((resolve, reject) => {
                components_4.RequireJS.require(plugin, async (editor, colorSyntax, codeSyntaxHighlight, tableMergedCell, uml) => {
                    this.editor = editor;
                    resolve([colorSyntax, codeSyntaxHighlight, tableMergedCell, uml]);
                });
            });
        }
        async loadPlugins() {
            this.editorPlugins = await this.loadPlugin(libPlugins);
        }
        onToggleEditor(value) {
            var _a, _b;
            if (!this.inline)
                return;
            if (value) {
                this.pnlEditorWrap.visible = true;
                this.pnlViewerWrap.visible = false;
                this.pnlEditor.visible = true;
                const newVal = ((_a = this.mdEditor) === null || _a === void 0 ? void 0 : _a.getMarkdown()) || this.data;
                this.mdEditor.setMarkdown(newVal);
            }
            else {
                this.pnlEditorWrap.visible = false;
                this.pnlViewerWrap.visible = true;
                this.pnlEditor.visible = false;
                const newVal = ((_b = this.mdEditor) === null || _b === void 0 ? void 0 : _b.getMarkdown()) || this.data;
                this.mdViewer.setMarkdown(newVal);
                this.toggleEmpty(!newVal);
                if (newVal !== this.data)
                    this.onConfirm();
            }
        }
        async init() {
            super.init();
            const width = this.getAttribute('width', true);
            const height = this.getAttribute('height', true);
            const background = this.getBackgroundColor();
            const initTag = { background, textAlign: 'left', settingColor: '' };
            if (width || height) {
                const finalWidth = width ? (typeof this.width === 'string' ? width : `${width}px`) : '100%';
                const finalHeight = height ? (typeof this.height === 'string' ? height : `${height}px`) : 'auto';
                initTag.width = finalWidth;
                initTag.height = finalHeight;
            }
            this.setTag(initTag);
            const lazyLoad = this.getAttribute('lazyLoad', true, false);
            if (!lazyLoad) {
                const themeAttr = this.getAttribute('theme', true);
                if (themeAttr) {
                    this.theme = themeAttr;
                    this.setTag(Object.assign(Object.assign({}, this.tag), { settingColor: '', background }));
                }
                await this.initPlugins();
                this.renderViewer();
                const data = this.getAttribute('data', true);
                if (data)
                    this.data = data;
                this.inline = this.getAttribute('inline', true, false);
            }
            this.setAttribute('draggable', 'false');
            document.addEventListener("selectionchange", this.onSelectionHandler);
        }
        onSelectionHandler(event) {
            var _a, _b, _c;
            event.preventDefault();
            event.stopPropagation();
            const selection = document.getSelection();
            const range = selection.rangeCount && selection.getRangeAt(0);
            if (!range)
                return;
            const nearestContainer = range.commonAncestorContainer.TEXT_NODE ? range.commonAncestorContainer.parentElement : range.commonAncestorContainer;
            const parentEditor = (_a = nearestContainer.parentElement) === null || _a === void 0 ? void 0 : _a.closest('#pnlEditorWrap');
            const editor = (_b = nearestContainer.parentElement) === null || _b === void 0 ? void 0 : _b.closest('i-scom-markdown-editor');
            const isDragging = (_c = parentEditor === null || parentEditor === void 0 ? void 0 : parentEditor.closest('ide-toolbar')) === null || _c === void 0 ? void 0 : _c.classList.contains('to-be-dropped');
            if (!selection.toString() && !editor) {
                this.resetEditors();
                return;
            }
            if (parentEditor || isDragging)
                return;
            if (this.selectionTimer)
                clearTimeout(this.selectionTimer);
            this.selectionTimer = setTimeout(() => {
                var _a, _b;
                const selection = document.getSelection();
                const selectionText = selection.toString();
                this.resetEditors();
                if (selection && selection.rangeCount) {
                    const range = selection.getRangeAt(0);
                    const nearestContainer = range.commonAncestorContainer;
                    if (nearestContainer.TEXT_NODE) {
                        const parentEditor = (_a = nearestContainer.parentElement) === null || _a === void 0 ? void 0 : _a.closest('i-scom-markdown-editor');
                        const isDragging = (_b = parentEditor === null || parentEditor === void 0 ? void 0 : parentEditor.closest('ide-toolbar')) === null || _b === void 0 ? void 0 : _b.classList.contains('to-be-dropped');
                        if (parentEditor && !isDragging) {
                            parentEditor.onToggleEditor(true);
                            const startIndex = this.data.indexOf(selectionText);
                            this.mdEditor.setSelection(startIndex, selectionText.length);
                        }
                    }
                }
            }, 500);
        }
        resetEditors() {
            const editors = document.querySelectorAll('i-scom-markdown-editor');
            for (let editor of editors) {
                editor.onToggleEditor(false);
            }
        }
        _getActions(themeSchema) {
            const actions = [
                {
                    name: 'Edit',
                    icon: 'edit',
                    visible: () => !this.inline,
                    command: (builder, userInputData) => {
                        let _oldData = '';
                        return {
                            execute: async () => {
                                _oldData = this._data;
                                const content = userInputData.content;
                                await this.setData({ content });
                                if (builder === null || builder === void 0 ? void 0 : builder.setData)
                                    builder.setData({ content });
                            },
                            undo: async () => {
                                this._data = _oldData;
                                await this.setData({ content: this._data });
                                if (builder === null || builder === void 0 ? void 0 : builder.setData)
                                    builder.setData({ content: this._data });
                            },
                            redo: () => { }
                        };
                    },
                    customUI: {
                        render: (data, onConfirm) => {
                            const vstack = new components_4.VStack(null, { gap: '1rem' });
                            const pnlConfig = new components_4.VStack();
                            const config = new index_1.default(pnlConfig, {
                                content: this._data,
                                theme: this.theme,
                                margin: { bottom: '1rem' }
                            });
                            config.background = { color: this.getBackgroundColor() }; // bg for editor parent
                            config.setTag(Object.assign({}, this.tag));
                            const pnlButton = new components_4.HStack(undefined, {
                                justifyContent: 'end',
                                alignItems: 'center',
                                gap: 5
                            });
                            const button = new components_4.Button(pnlButton, {
                                caption: 'Confirm',
                                height: 40,
                                background: { color: Theme.colors.primary.main },
                                font: { color: Theme.colors.primary.contrastText }
                            });
                            vstack.append(pnlConfig);
                            vstack.append(pnlButton);
                            button.onClick = async () => {
                                const content = config.content;
                                if (onConfirm)
                                    onConfirm(true, { content });
                            };
                            return vstack;
                        }
                    }
                },
                {
                    name: 'Theme Settings',
                    icon: 'palette',
                    visible: () => themeSchema != null && themeSchema != undefined,
                    command: (builder, userInputData) => {
                        let oldTag = {};
                        return {
                            execute: async () => {
                                if (!userInputData)
                                    return;
                                oldTag = JSON.parse(JSON.stringify(this.tag));
                                if (userInputData.background) {
                                    this.tag.background = userInputData.background;
                                    this.tag.settingColor = userInputData.background;
                                }
                                if (userInputData.width)
                                    this.tag.width = userInputData.width;
                                if (userInputData.height)
                                    this.tag.height = userInputData.height;
                                if (userInputData.textAlign)
                                    this.tag.textAlign = userInputData.textAlign;
                                if (builder)
                                    builder.setTag(this.tag);
                                else
                                    this.setTag(this.tag);
                            },
                            undo: () => {
                                if (!userInputData)
                                    return;
                                this.tag = JSON.parse(JSON.stringify(oldTag));
                                if (builder)
                                    builder.setTag(this.tag);
                                else
                                    this.setTag(this.tag);
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: themeSchema
                }
            ];
            return actions;
        }
        updateMarkdown(config) {
            if (!config)
                return;
            const { width, height, background, textAlign = 'left' } = config;
            if (this.pnlMarkdownEditor) {
                this.pnlMarkdownEditor.background.color = background;
                this.pnlMarkdownEditor.style.textAlign = textAlign;
            }
            if (this.mdViewer) {
                if (width)
                    this.mdViewer.width = width;
                if (height)
                    this.mdViewer.height = height;
            }
        }
        getData() {
            return { content: this.data };
        }
        toggleEmpty(value) {
            this.pnlEmpty.visible = value;
            this.pnlViewerWrap.visible = !value;
        }
        async setData(value) {
            this._data = value.content || '';
            this.toggleEmpty(!this._data);
            if (this.mdViewer) {
                this.mdViewer.setMarkdown(this._data);
            }
        }
        getTag() {
            return this.tag;
        }
        async setTag(value) {
            const newValue = value || {};
            for (let prop in newValue) {
                if (newValue.hasOwnProperty(prop)) {
                    if (prop === 'width' || prop === 'height') {
                        this.tag[prop] = typeof newValue[prop] === 'string' ? newValue[prop] : `${newValue[prop]}px`;
                    }
                    else if (prop === 'background') {
                        this.tag.background = (newValue === null || newValue === void 0 ? void 0 : newValue.settingColor) || this.getBackgroundColor();
                    }
                    else
                        this.tag[prop] = newValue[prop];
                }
            }
            // this.height = this.tag?.height || 'auto';
            this.height = 'auto';
            this.updateMarkdown(Object.assign({}, this.tag));
        }
        getEditCommand(builder) {
            let _oldData = '';
            return {
                execute: async () => {
                    var _a;
                    _oldData = this._data;
                    const content = (_a = this.mdEditor) === null || _a === void 0 ? void 0 : _a.getMarkdown();
                    await this.setData({ content });
                    if (builder === null || builder === void 0 ? void 0 : builder.setData)
                        builder.setData({ content });
                },
                undo: async () => {
                    this._data = _oldData;
                    await this.setData({ content: this._data });
                    if (builder === null || builder === void 0 ? void 0 : builder.setData)
                        builder.setData({ content: this._data });
                },
                redo: () => { }
            };
        }
        setOnConfirm(commandHistory, builder) {
            this.commandHistory = commandHistory;
            this.builder = builder;
        }
        onConfirm() {
            const editCommand = this.getEditCommand(this.builder);
            this.commandHistory.execute(editCommand);
        }
        getConfigurators() {
            return [
                {
                    name: 'Builder Configurator',
                    target: 'Builders',
                    getActions: () => {
                        const themeSchema = this.getThemeSchema();
                        return this._getActions(themeSchema);
                    },
                    getData: this.getData.bind(this),
                    setData: async (data) => {
                        const defaultData = data_json_1.default.defaultBuilderData;
                        await this.setData(Object.assign(Object.assign({}, defaultData), data));
                    },
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this),
                    setRootParent: this.setRootParent.bind(this),
                    setOnConfirm: this.setOnConfirm.bind(this)
                },
                {
                    name: 'Emdedder Configurator',
                    target: 'Embedders',
                    getData: this.getData.bind(this),
                    setData: this.setData.bind(this),
                    getTag: this.getTag.bind(this),
                    setTag: this.setTag.bind(this)
                }
            ];
        }
        getThemeSchema() {
            const themeSchema = {
                type: 'object',
                properties: {
                    textAlign: {
                        type: 'string',
                        enum: [
                            'left',
                            'center',
                            'right'
                        ]
                    },
                    background: {
                        type: 'string',
                        format: 'color'
                    }
                }
            };
            return themeSchema;
        }
        render() {
            return (this.$render("i-vstack", { id: "pnlMarkdownEditor", minHeight: 50 },
                this.$render("i-panel", { id: "pnlEditorWrap", visible: false },
                    this.$render("i-panel", { id: "pnlEditor" })),
                this.$render("i-vstack", { id: "pnlViewerWrap", width: "100%" },
                    this.$render("i-panel", { id: "pnlViewer" }),
                    this.$render("i-panel", { id: "pnlEmpty" },
                        this.$render("i-label", { caption: "Click to edit text", opacity: 0.5, font: { color: '#222' }, padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' } })))));
        }
    };
    ScomMarkdownEditor = __decorate([
        components_4.customModule,
        (0, components_4.customElements)('i-scom-markdown-editor')
    ], ScomMarkdownEditor);
    exports.default = ScomMarkdownEditor;
});
