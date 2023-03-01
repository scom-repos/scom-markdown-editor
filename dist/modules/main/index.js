var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define("@markdown-editor/main/index.css.ts", ["require", "exports", "@ijstech/components"], function (require, exports, components_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_1.Styles.Theme.ThemeVars;
    const typingAnim = components_1.Styles.keyframes({
        '0%': { "transform": "translate(0, -7px)" },
        '25%': { "transform": "translate(0, 0)" },
        '50%': { "transform": "translate(0, 0)" },
        '75%': { "transform": "translate(0, 0)" },
        '100%': { "transform": "translate(0, 7px)" }
    });
    components_1.Styles.cssRule('#pnlMarkdownEditor', {
        $nest: {
            'i-panel.container': {
                width: Theme.layout.container.width,
                maxWidth: Theme.layout.container.maxWidth,
                overflow: Theme.layout.container.overflow,
                textAlign: Theme.layout.container.textAlign,
                margin: '0 auto'
            },
            // '#inputAIPrompt': {
            //     width: '90% !important'
            // },   
            // '#inputAIPrompt > input': {
            //     width: '100% !important'
            // },
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
        }
    });
});
define("@markdown-editor/main/API.ts", ["require", "exports", "@markdown-editor/store"], function (require, exports, store_1) {
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
define("@markdown-editor/main", ["require", "exports", "@ijstech/components", "@markdown-editor/main/API.ts", "@markdown-editor/store", "@markdown-editor/main/index.css.ts"], function (require, exports, components_2, API_1, store_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.MarkdownBlock = void 0;
    const Theme = components_2.Styles.Theme.ThemeVars;
    const configSchema = {
        type: 'object',
        properties: {
            width: {
                type: 'string',
            },
            height: {
                type: 'string',
            },
            background: {
                type: 'string',
            }
        }
    };
    let MarkdownBlock = class MarkdownBlock extends components_2.Module {
        constructor(parent, options) {
            super(parent, options);
            this.defaultEdit = true;
            this.isEditing = false;
            this.isStopped = false;
            if (options) {
                store_2.setDataFromSCConfig(options);
            }
        }
        async init() {
            super.init();
            if (!this.data) {
                await this.renderEditor();
                this.renderEmptyPnl();
            }
        }
        getConfigSchema() {
            return configSchema;
        }
        getActions() {
            const actions = [
                {
                    name: 'Edit',
                    icon: 'edit',
                    visible: () => !this.isEditing,
                    command: (builder, userInputData) => {
                        return {
                            execute: () => {
                                this.edit();
                                if (builder) {
                                    builder.classList.add('is-editing');
                                    const section = builder.closest('ide-section');
                                    section && (section.style.height = 'auto');
                                }
                            },
                            undo: () => {
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: {}
                },
                {
                    name: 'Confirm',
                    icon: 'check',
                    visible: () => this.isEditing,
                    command: (builder, userInputData) => {
                        return {
                            execute: () => {
                                this.confirm();
                                if (builder) {
                                    builder.classList.remove('is-editing');
                                    const section = builder.closest('ide-section');
                                    section && (section.style.height = 'auto');
                                }
                            },
                            undo: () => {
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: {}
                },
                {
                    name: 'Discard',
                    icon: 'times',
                    visible: () => this.isEditing,
                    command: (builder, userInputData) => {
                        return {
                            execute: () => {
                                this.discard();
                                if (builder) {
                                    builder.classList.remove('is-editing');
                                    const section = builder.closest('ide-section');
                                    section && (section.style.height = 'auto');
                                }
                            },
                            undo: () => {
                            },
                            redo: () => { }
                        };
                    },
                    userInputDataSchema: {}
                }
            ];
            return actions;
        }
        async onConfigSave(config) {
            this.tag = config;
            this.updateMarkdown(config);
        }
        updateMarkdown(config) {
            if (!config)
                return;
            const { width, height, background } = config;
            if (this.pnlMarkdownEditor) {
                this.pnlMarkdownEditor.background.color = background;
            }
            if (this.mdEditor) {
                if (width)
                    this.mdEditor.width = width;
                if (height)
                    this.mdEditor.height = height;
            }
            if (this.mdViewer) {
                if (width)
                    this.mdViewer.width = width;
                // Using style because mode view doesnt have height attribute
                if (height)
                    this.mdViewer.style.height = height;
            }
        }
        getData() {
            return {
                content: this.data
            };
        }
        renderEmptyPnl() {
            this.pnlViewer.clearInnerHTML();
            if (this.pnlViewer.visible)
                this.pnlViewer.appendChild(this.$render("i-label", { caption: "Click to edit text", opacity: 0.5, display: "block", padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' } }));
        }
        async setData(value) {
            this.data = value.content || '';
            this.setTag({ width: value.width, height: value.height });
            this.pnlEditor.visible = this.pnlAIPrompt.visible = this.isEditing;
            this.pnlViewer.visible = !this.isEditing;
            if (!this.data) {
                this.renderEmptyPnl();
                return;
            }
            ;
            const { width, height } = this.tag || {};
            if (!this.mdViewer) {
                this.mdViewer = await components_2.MarkdownEditor.create({
                    viewer: true,
                    value: this.data,
                    width,
                    height
                });
                this.mdViewer.display = 'block';
                if (height)
                    this.mdViewer.style.height = height;
                this.pnlViewer.clearInnerHTML();
                this.pnlViewer.appendChild(this.mdViewer);
            }
            else {
                this.pnlViewer.clearInnerHTML();
                this.pnlViewer.appendChild(this.mdViewer);
                this.mdViewer.value = this.data;
            }
        }
        getTag() {
            return this.tag;
        }
        async setTag(value) {
            this.tag = value;
            this.updateMarkdown(value);
        }
        async edit() {
            // this.pnlEditor.visible = true;
            // this.pnlViewer.visible = false;
            this.isEditing = true;
            this.renderEditor();
        }
        async confirm() {
            var _a;
            // this.pnlEditor.visible = false;
            // this.pnlViewer.visible = true;
            this.isEditing = false;
            await this.setData({
                content: ((_a = this.mdEditor) === null || _a === void 0 ? void 0 : _a.getMarkdownValue()) || ''
            });
            const builder = this.parent.closest('ide-toolbar');
            builder && builder.setData({ content: this.data });
        }
        async discard() {
            // this.pnlEditor.visible = false;
            // this.pnlViewer.visible = true;
            this.isEditing = false;
            await this.setData({
                content: this.data
            });
            const builder = this.parent.closest('ide-toolbar');
            builder && builder.setData({ content: this.data });
        }
        validate() {
            if (this.mdEditor && this.mdEditor.getMarkdownValue()) {
                return true;
            }
            return false;
        }
        async renderEditor() {
            const { width, height } = this.tag || {};
            if (!this.mdEditor) {
                this.mdEditor = await components_2.MarkdownEditor.create({
                    value: this.data,
                    mode: 'wysiwyg',
                    width,
                    height
                });
                this.mdEditor.display = 'block';
                this.pnlEditor.clearInnerHTML();
                this.pnlEditor.appendChild(this.mdEditor);
            }
            else {
                this.mdEditor.value = this.data;
            }
            this.pnlEditor.visible = this.pnlAIPrompt.visible = this.isEditing;
            this.pnlViewer.visible = !this.isEditing;
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
                ({ value, done } = await reader.read());
                const valueString = new TextDecoder().decode(value);
                const lines = valueString.split('\n').filter(line => line.trim() !== '');
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
                // console.log('answer', answer);
                if (!this.isStopped)
                    await this.readAllChunks(result);
            }
            catch (_a) {
            }
            this.inputAIPrompt.value = '';
            this.toggleStopBtn(false);
        }
        async stopAPIPrompt() {
            this.isStopped = true;
            this.inputAIPrompt.value = '';
            this.toggleStopBtn(false);
        }
        render() {
            return (this.$render("i-vstack", { id: "pnlMarkdownEditor" },
                this.$render("i-panel", { id: 'pnlEditor', padding: { top: "0.5rem", bottom: "0.5rem", left: "1rem", right: "1rem" } }),
                this.$render("i-hstack", { id: 'pnlAIPrompt', width: "100%", horizontalAlignment: "space-between", verticalAlignment: "center", padding: { top: "0.5rem", bottom: "0.5rem", left: "1rem", right: "1rem" } },
                    this.$render("i-vstack", { width: "90%" },
                        this.$render("i-hstack", { id: "pnlWaiting", gap: 4, verticalAlignment: "center", minHeight: 32, width: "100%", height: "auto", border: { width: '0.5px', style: 'solid', color: Theme.divider }, background: { color: Theme.input.background }, padding: { left: '10px' }, visible: false },
                            this.$render("i-label", { font: { size: '1.5rem', color: Theme.input.fontColor }, caption: "AI is writing" }),
                            this.$render("i-hstack", { gap: 4, verticalAlignment: "center", class: "typing" },
                                this.$render("i-icon", { name: "circle", width: 4, height: 4, fill: Theme.input.fontColor }),
                                this.$render("i-icon", { name: "circle", width: 4, height: 4, fill: Theme.input.fontColor }),
                                this.$render("i-icon", { name: "circle", width: 4, height: 4, fill: Theme.input.fontColor }))),
                        this.$render("i-input", { id: "inputAIPrompt", placeholder: "Ask AI to edit or generate...", font: { size: '1.5rem' }, height: "auto", width: "100%" })),
                    this.$render("i-button", { id: "btnStop", caption: "Stop", width: "10%", visible: false, font: { color: 'rgba(255,255,255)' }, padding: { top: "0.5rem", bottom: "0.5rem", left: "1rem", right: "1rem" }, onClick: this.stopAPIPrompt }),
                    this.$render("i-button", { id: "btnSend", caption: "Send", width: "10%", font: { color: 'rgba(255,255,255)' }, padding: { top: "0.5rem", bottom: "0.5rem", left: "1rem", right: "1rem" }, onClick: this.sendAIPrompt })),
                this.$render("i-panel", { id: 'pnlViewer', minHeight: 20 })));
        }
    };
    MarkdownBlock = __decorate([
        components_2.customModule
    ], MarkdownBlock);
    exports.MarkdownBlock = MarkdownBlock;
});
