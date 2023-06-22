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
        overflow: 'hidden auto',
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
        const APIUrl = store_1.getAIAPIUrl();
        const APIKey = store_1.getAIAPIKey();
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
            '.toastui-editor-mode-switch': {
                background: 'transparent'
            },
            '#mdEditor .toastui-editor-md-container': {
                backgroundColor: 'var(--bg-container, transparent)'
            },
            '#mdEditor .toastui-editor-ww-container': {
                backgroundColor: 'var(--bg-container, transparent)'
            }
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
                const result = await API_1.fetchAIGeneratedText(this.inputAIPrompt.value);
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
            return (this.$render("i-panel", { id: "wrapPnl", padding: { left: '1rem', right: '1rem', top: '1rem', bottom: '2rem' } },
                this.$render("i-panel", { id: 'pnlEditor', padding: {
                        top: '0.5rem',
                        bottom: '0.5rem',
                        left: '1rem',
                        right: '1rem',
                    } },
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
        components_3.customElements('i-scom-markdown-editor-config')
    ], Config);
    exports.default = Config;
});
define("@scom/scom-markdown-editor", ["require", "exports", "@ijstech/components", "@scom/scom-markdown-editor/store.ts", "@scom/scom-markdown-editor/data.json.ts", "@scom/scom-markdown-editor/editor/index.tsx", "@scom/scom-markdown-editor/index.css.ts"], function (require, exports, components_4, store_2, data_json_1, index_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_4.Styles.Theme.ThemeVars;
    const lightTheme = components_4.Styles.Theme.defaultTheme;
    const darkTheme = components_4.Styles.Theme.darkTheme;
    let ScomMarkdownEditor = class ScomMarkdownEditor extends components_4.Module {
        constructor(parent, options) {
            super(parent, options);
            this.tag = {};
            this.defaultEdit = true;
            this._theme = 'light';
            this.isSetBg = false;
            if (data_json_1.default)
                store_2.setDataFromSCConfig(data_json_1.default);
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
            this._theme = value !== null && value !== void 0 ? value : 'light';
            if (this.pnlMarkdownEditor && !this.isSetBg) {
                this.tag.background = this.getBackgroundColor();
                this.pnlMarkdownEditor.background.color = this.tag.background;
            }
            if (this.mdViewer)
                this.mdViewer.theme = value;
        }
        getBackgroundColor() {
            const rowParent = this.parent.closest('ide-row');
            let background = '';
            if (rowParent) {
                const rowStyles = window.getComputedStyle(rowParent, null);
                background = rowParent.background.color || (rowStyles === null || rowStyles === void 0 ? void 0 : rowStyles.backgroundColor);
            }
            const bgByTheme = this.theme === 'light' ? lightTheme.background.main : darkTheme.background.main;
            return background || bgByTheme;
        }
        async init() {
            super.init();
            const width = this.getAttribute('width', true);
            const height = this.getAttribute('height', true);
            const background = this.getBackgroundColor();
            const initTag = { background, textAlign: 'left' };
            if (width || height) {
                const finalWidth = width ? (typeof this.width === 'string' ? width : `${width}px`) : '100%';
                const finalHeight = height ? (typeof this.height === 'string' ? height : `${height}px`) : 'auto';
                initTag.width = finalWidth;
                initTag.height = finalHeight;
            }
            this.setTag(initTag, true);
            const lazyLoad = this.getAttribute('lazyLoad', true, false);
            if (!lazyLoad) {
                const themeAttr = this.getAttribute('theme', true);
                if (themeAttr) {
                    this.theme = themeAttr;
                    this.setTag(Object.assign(Object.assign({}, this.tag), { background: this.getBackgroundColor() }), true);
                }
                this.data = this.getAttribute('data', true, '');
            }
        }
        _getActions(themeSchema) {
            const actions = [
                {
                    name: 'Edit',
                    icon: 'edit',
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
                    userInputDataSchema: {},
                    customUI: {
                        render: (data, onConfirm) => {
                            const vstack = new components_4.VStack();
                            const config = new index_1.default(null, {
                                content: this._data,
                                theme: this.theme,
                                margin: { bottom: '1rem' }
                            });
                            config.background = { color: this.getBackgroundColor() }; // bg for editor parent
                            config.setTag(Object.assign({}, this.tag));
                            const button = new components_4.Button(null, {
                                caption: 'Confirm',
                                background: { color: Theme.colors.primary.main },
                                font: { color: Theme.colors.primary.contrastText }
                            });
                            vstack.append(config);
                            vstack.append(button);
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
                                oldTag = Object.assign({}, this.tag);
                                this.setTag(userInputData);
                                if (builder)
                                    builder.setTag(userInputData);
                            },
                            undo: () => {
                                if (!userInputData)
                                    return;
                                this.setTag(oldTag);
                                if (builder)
                                    builder.setTag(oldTag);
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
            const { width, height, background } = config;
            if (this.pnlMarkdownEditor) {
                this.pnlMarkdownEditor.background.color = background;
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
            this.mdViewer.visible = !value;
        }
        async setData(value) {
            this._data = value.content || '';
            this.toggleEmpty(!this._data);
            this.mdViewer.value = this.data;
        }
        getTag() {
            return this.tag;
        }
        async setTag(value, init) {
            var _a, _b;
            const newValue = value || {};
            if (newValue.hasOwnProperty('background') && !init)
                this.isSetBg = true;
            for (let prop in newValue) {
                if (newValue.hasOwnProperty(prop)) {
                    if (prop === 'width' || prop === 'height') {
                        this.tag[prop] = typeof newValue[prop] === 'string' ? newValue[prop] : `${newValue[prop]}px`;
                    }
                    else if (prop === 'background') {
                        const canNotSetBg = this.isSetBg && init;
                        this.tag[prop] = canNotSetBg ? this.tag[prop] : newValue[prop];
                    }
                    else
                        this.tag[prop] = newValue[prop];
                }
            }
            this.height = ((_a = this.tag) === null || _a === void 0 ? void 0 : _a.height) || 'auto';
            this.pnlMarkdownEditor.style.textAlign = ((_b = this.tag) === null || _b === void 0 ? void 0 : _b.textAlign) || "left";
            this.updateMarkdown(this.tag);
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
                    setTag: this.setTag.bind(this)
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
            return (this.$render("i-vstack", { id: "pnlMarkdownEditor" },
                this.$render("i-panel", { id: "pnlViewer", minHeight: 20 },
                    this.$render("i-markdown-editor", { id: "mdViewer", viewer: true, value: this.data, width: '100%', height: 'auto', visible: false })),
                this.$render("i-panel", { id: "pnlEmpty" },
                    this.$render("i-label", { caption: "Click to edit text", opacity: 0.5, font: { color: '#222' }, padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' } }))));
        }
    };
    ScomMarkdownEditor = __decorate([
        components_4.customModule,
        components_4.customElements('i-scom-markdown-editor')
    ], ScomMarkdownEditor);
    exports.default = ScomMarkdownEditor;
});
