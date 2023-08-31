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
    const pStyle = (level) => {
        return {
            fontSize: `${24 - (level * 2)}px`,
            fontWeight: 'normal'
        };
    };
    const pBaseFontSize = (size) => {
        switch (size) {
            case 'xs':
                return 10;
            case 'sm':
                return 12;
            case 'md':
                return 14;
            case 'lg':
                return 16;
            case 'xl':
                return 18;
        }
    };
    const pSizeStyle = (level, size) => {
        const baseFontSize = pBaseFontSize(size);
        const ratio = 1.25;
        const fontSize = baseFontSize * Math.pow(ratio, level);
        return `font-size: ${Math.round((fontSize + Number.EPSILON) * 100) / 100}px;`;
    };
    let fontSizeStyle = '';
    ['xs', 'sm', 'md', 'lg', 'xl'].forEach(size => {
        [1, 2, 3, 4, 5, 6].forEach(p => {
            fontSizeStyle += `.font-${size} .toastui-editor-contents .p${p} {
            ${pSizeStyle(p, size)}
        }\n`;
        });
        [1, 2, 3, 4, 5, 6].forEach(p => {
            fontSizeStyle += `.i-page-section.font-${size} .toastui-editor-contents .p${p} {
            ${pSizeStyle(p, size)}
        }\n`;
        });
        fontSizeStyle += `.font-${size} .toastui-editor-contents p {
        ${pSizeStyle(1, size)}
    }\n`;
        fontSizeStyle += `i-scom-markdown-editor.font-${size} .toastui-editor-contents p {
        ${pSizeStyle(1, size)}
    }\n`;
    });
    ['xs', 'sm', 'md', 'lg', 'xl'].forEach(size => {
        [1, 2, 3, 4, 5, 6].forEach(p => {
            fontSizeStyle += `.font-${size} .toastui-editor-contents h${p} {
            ${pSizeStyle(p, size)}
        }\n`;
        });
        [1, 2, 3, 4, 5, 6].forEach(p => {
            fontSizeStyle += `.i-page-section.font-${size} .toastui-editor-contents h${p} {
            ${pSizeStyle(p, size)}
        }\n`;
        });
    });
    components_1.Styles.cssRaw(fontSizeStyle);
    components_1.Styles.cssRule('i-scom-markdown-editor', {
        overflow: 'hidden',
        outline: 'none',
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
            // '.toastui-editor-dropdown-toolbar': {
            //     maxWidth: '100%',
            //     flexWrap: 'wrap',
            //     height: 'auto'
            // },
            // ".toastui-editor-contents ul:has(li input[type='checkbox'])": {
            //     paddingLeft: 0,
            // },
            // ".toastui-editor-contents ul li:has(input[type='checkbox']):before": {
            //     content: "none",
            // },
            '.toastui-editor-contents p': {
                color: `var(--custom-text-color, var(--text-primary))`
            },
            '#pnlEditorWrap': {
                $nest: {
                    '.toastui-editor-defaultUI-toolbar': {
                        display: 'none'
                    },
                    '.toastui-editor-toolbar': {
                        display: 'none'
                    },
                    '.toastui-editor-defaultUI .ProseMirror': {
                        padding: '0',
                        margin: '10px 0'
                    },
                    '.toastui-editor-defaultUI': {
                        border: 'none',
                        outline: 'none'
                    },
                    '.toastui-editor-mode-switch': {
                        background: 'transparent'
                    },
                    ".toastui-editor-md-container": {
                        backgroundColor: `var(--custom-background-color, var(--background-main))`
                    },
                    ".toastui-editor-ww-container": {
                        backgroundColor: `var(--custom-background-color, var(--background-main))`
                    },
                    '.toastui-editor-contents': {
                        transition: 'all 125ms cubic-bezier(0.4,0,0.2,1)'
                    }
                }
            },
            '.custom-p .p1, p .p1': pStyle(0),
            '.custom-p .p2, p .p2': pStyle(1),
            '.custom-p .p3, p .p3': pStyle(2),
            '.custom-p .p4, p .p4': pStyle(3),
            '.custom-p .p5, p .p5': pStyle(4),
            '.custom-p .p6, p .p6': pStyle(5),
            '.custom-p strong *, p strong *': {
                fontWeight: 'bold !important'
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
    const pStyle = (level) => {
        return {
            fontSize: `${24 - (level * 2)}px`,
            fontWeight: 'normal'
        };
    };
    components_2.Styles.cssRule('i-scom-markdown-editor-config', {
        backgroundColor: '#fff',
        color: '#222',
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
            '.toastui-editor-contents p': {
                color: `var(--custom-text-color, var(--text-primary))`
            },
            '.toastui-editor-contents': {
                color: `var(--custom-text-color, var(--text-primary))`
            },
            '.ProseMirror': {
                color: `var(--custom-text-color, var(--text-primary))`
            },
            '.toastui-editor-mode-switch': {
                background: 'transparent'
            },
            '#wrapPnl .toastui-editor-md-container': {
                backgroundColor: `var(--custom-background-color, var(--background-main))`
            },
            '#wrapPnl .toastui-editor-ww-container': {
                backgroundColor: `var(--custom-background-color, var(--background-main))`
            },
            '.paragraph': {
                fontSize: '1.125rem !important'
            },
            '[data-type="Paragraph"]': {
                display: 'none'
            },
            '.p-item': {
                color: '#222'
            },
            '.p-item i-label': {
                color: '#222'
            },
            '.p-item:hover': {
                background: '#dff4ff'
            },
            '.custom-p .p1, p .p1': pStyle(0),
            '.custom-p .p2, p .p2': pStyle(1),
            '.custom-p .p3, p .p3': pStyle(2),
            '.custom-p .p4, p .p4': pStyle(3),
            '.custom-p .p5, p .p5': pStyle(4),
            '.custom-p .p6, p .p6': pStyle(5),
            '.custom-p strong *, p strong *': {
                fontWeight: 'bold !important'
            }
        }
    });
});
define("@scom/scom-markdown-editor/editor/index.tsx", ["require", "exports", "@ijstech/components", "@scom/scom-markdown-editor/API.ts", "@scom/scom-markdown-editor/editor/index.css.ts"], function (require, exports, components_3, API_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const Theme = components_3.Styles.Theme.ThemeVars;
    const LARGE_SIZE = 24;
    let Config = class Config extends components_3.Module {
        constructor(parent, options) {
            super(parent, options);
            this._data = '';
            this._theme = 'light';
            this.isStopped = false;
            this.levelMapper = {};
            this.tag = {};
            this.onParagraphClicked = this.onParagraphClicked.bind(this);
        }
        get content() {
            var _a;
            return (_a = this.mdEditor) === null || _a === void 0 ? void 0 : _a.getMarkdownValue();
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
        get currentEditor() {
            return this.mdEditor.getEditorElm();
        }
        getTag() {
            return this.tag;
        }
        async setTag(value) {
            const { backgroundColor, customBackgroundColor, textColor, customTextColor, textAlign } = value;
            this.tag = { backgroundColor, customBackgroundColor, textColor, customTextColor, textAlign };
            this.updateMardown();
        }
        updateMardown() {
            if (this.wrapPnl) {
                const { backgroundColor, customBackgroundColor, textColor, customTextColor, textAlign } = this.tag;
                this.wrapPnl.style.textAlign = textAlign || "left";
                if (backgroundColor && customBackgroundColor)
                    this.style.setProperty('--custom-background-color', backgroundColor || '');
                else
                    this.style.removeProperty('--custom-background-color');
                if (textColor && customTextColor)
                    this.style.setProperty('--custom-text-color', textColor);
                else
                    this.style.removeProperty('--custom-text-color');
            }
        }
        async renderEditor() {
            if (!this.mdEditor) {
                this.mdEditor = await components_3.MarkdownEditor.create({
                    value: this._data,
                    mode: 'wysiwyg',
                    width: '100%',
                    height: 'auto',
                    theme: this.theme,
                    plugins: [this.paragraphPlugin.bind(this)]
                });
                this.mdEditor.display = 'block';
                this.pnlEditor.clearInnerHTML();
                this.pnlEditor.appendChild(this.mdEditor);
            }
            this.mdEditor.value = this._data;
            this.mdEditor.theme = this.theme;
            this.updateMardown();
        }
        onParagraphClicked(level) {
            if (this.currentEditor) {
                this.currentEditor.exec('customParagraph', { level });
                this.currentEditor.eventEmitter.emit('closePopup');
            }
        }
        paragraphPlugin(context, options) {
            const container = document.createElement('div');
            this.createPDropdown(container);
            context.eventEmitter.listen('command', (type, params, options) => {
                if (type === 'color') {
                    console.log('set colors', params);
                    this.currentEditor.exec('color', params);
                    this.currentEditor.exec('customParagraph', { level: -1 });
                }
            });
            return {
                markdownCommands: {
                    customParagraph: ({ level }, state, dispatch) => {
                        if (level === -1)
                            return false;
                        const { tr, selection, doc, schema } = state;
                        const fromPos = selection.$head.path[2];
                        const pNode = selection.$head.path[1];
                        const openTag = `<span class="p${level + 1}">`;
                        const closeTag = `</span>`;
                        let hasSet = false;
                        let headingLength = 0;
                        doc.descendants((node, pos) => {
                            if (pos >= fromPos && pos <= fromPos + doc.child(pNode).nodeSize) {
                                const isText = node.type.name === 'text';
                                if (isText) {
                                    const content = node.text || '';
                                    if (/^\#+/g.test(content)) {
                                        headingLength += node.nodeSize;
                                        tr.delete(pos, pos + node.nodeSize);
                                    }
                                    else if ((/class=\"p[1-6]\"/g).test(content)) {
                                        const newText = content.replace(/class=\"p[1-6]\"/g, `class="p${level + 1}"`);
                                        tr.replaceWith(pos - headingLength, pos + node.nodeSize - headingLength, schema.text(newText));
                                        hasSet = true;
                                    }
                                }
                            }
                        });
                        const mainNode = doc.child(pNode);
                        if (!mainNode)
                            return false;
                        if (!hasSet) {
                            const textContent = mainNode.content.textBetween(0, mainNode.content.size, '\n').replace(/^\#+/g, '');
                            const newContent = `${openTag}${textContent}${closeTag}`;
                            tr.replaceWith(fromPos, fromPos + mainNode.content.size, schema.text(newContent));
                        }
                        dispatch(tr);
                        return true;
                    }
                },
                wysiwygCommands: {
                    customParagraph: ({ level }, state, dispatch) => {
                        const { tr, selection, doc, schema } = state;
                        const nodeIndex = selection.$head.path[1];
                        const nodePos = selection.$head.path[2];
                        const currentLevel = level !== -1 ? level : this.levelMapper[nodeIndex];
                        if (currentLevel === undefined || currentLevel === -1)
                            return false;
                        this.levelMapper[nodeIndex] = level;
                        let node = doc.child(nodeIndex);
                        if (node) {
                            const attrs = Object.assign(Object.assign({}, node.attrs), { htmlAttrs: { class: `p${currentLevel + 1}` } });
                            const pNode = schema.nodes.paragraph.create(attrs, node.content, node.marks);
                            tr.replaceWith(nodePos, nodePos + node.nodeSize, pNode);
                            const pMark = schema.marks.span.create(attrs);
                            tr.addMark(nodePos, nodePos + pNode.nodeSize, pMark);
                            node = doc.child(nodeIndex);
                            node.descendants((childNode, childPos) => {
                                var _a;
                                if (childNode.marks.length) {
                                    for (let mark of childNode.marks) {
                                        const htmlAttrs = Object.assign(Object.assign({}, (((_a = mark.attrs) === null || _a === void 0 ? void 0 : _a.htmlAttrs) || {})), { class: `p${currentLevel + 1}` });
                                        const newMark = schema.marks.span.create(Object.assign(Object.assign({}, mark.attrs), { htmlAttrs }));
                                        tr.addMark(nodePos + childPos + 1, nodePos + childPos + childNode.nodeSize + 1, newMark);
                                    }
                                }
                            });
                            dispatch(tr);
                            return true;
                        }
                        return false;
                    }
                },
                toolbarItems: [
                    {
                        groupIndex: 0,
                        itemIndex: 1,
                        item: {
                            name: 'paragraph',
                            tooltip: 'Paragraph',
                            text: 'P',
                            className: 'toastui-editor-toolbar-icons paragraph',
                            style: { backgroundImage: 'none' },
                            popup: {
                                className: 'toastui-editor-popup',
                                body: container,
                                style: { width: 'auto' }
                            }
                        }
                    }
                ],
                toHTMLRenderers: {
                    paragraph(node, context) {
                        return context.entering
                            ? { type: 'openTag', tagName: 'div', attributes: node.attrs, classNames: ['custom-p'], outerNewLine: true, innerNewLine: true }
                            : { type: 'closeTag', tagName: 'div', outerNewLine: true, innerNewLine: true };
                    },
                    htmlInline: {
                        span(node, { entering }) {
                            var _a;
                            let attributes = Object.assign({}, node.attrs);
                            if (!attributes.class && node.literal !== '</span>') {
                                const firstChild = ((_a = node.parent) === null || _a === void 0 ? void 0 : _a.firstChild) || null;
                                let className = '';
                                if (firstChild) {
                                    const execData = (/^\<span class=\"(p[1-6])\"\>/g).exec(firstChild.literal || '');
                                    className = execData ? execData[1] : '';
                                    attributes.class = className;
                                }
                            }
                            const classNames = attributes.classNames || [];
                            if (attributes.class)
                                classNames.push(attributes.class);
                            return entering
                                ? { type: 'openTag', tagName: 'span', attributes, classNames }
                                : { type: 'closeTag', tagName: 'span' };
                        }
                    }
                }
            };
        }
        async createPDropdown(parent) {
            parent.innerHTML = '';
            for (let i = 0; i < 6; i++) {
                parent.appendChild(this.$render("i-hstack", { verticalAlignment: "center", class: "pointer p-item", padding: { top: 4, bottom: 4, left: 12, right: 12 }, onClick: () => this.onParagraphClicked(i) },
                    this.$render("i-label", { caption: `Paragraph ${i + 1}`, font: { size: `${LARGE_SIZE - (i * 2)}px` } })));
            }
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
                this.$render("i-panel", { id: 'pnlEditor' }),
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
    let ScomMarkdownEditor = class ScomMarkdownEditor extends components_4.Module {
        constructor(parent, options) {
            super(parent, options);
            this.tag = {};
            this.defaultEdit = true;
            this._theme = 'light';
            this.commandHistory = null;
            if (data_json_1.default)
                (0, store_2.setDataFromSCConfig)(data_json_1.default);
            this.onBlurHandler = this.onBlurHandler.bind(this);
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
            // this.tag.textColor = this.getTextColor();
            // this.tag.backgroundColor = this.getBackgroundColor();
            // this.renderSettings(this.tag.textColor, this.tag.backgroundColor);
            if (this.mdViewer)
                this.mdViewer.theme = this.theme;
            if (this.mdEditor)
                this.mdEditor.theme = this.theme;
        }
        setRootParent(parent) {
            this._rootParent = parent;
            const newTag = Object.assign(Object.assign({}, this.tag), { backgroundColor: this.getBackgroundColor() });
            this.setTag(newTag);
        }
        getBackgroundColor() {
            let backgroundColor = '';
            if (this._rootParent) {
                const rowStyles = window.getComputedStyle(this._rootParent, null);
                backgroundColor = rowStyles === null || rowStyles === void 0 ? void 0 : rowStyles.backgroundColor;
            }
            return backgroundColor || this.getDefaultThemeColor();
        }
        getTextColor() {
            let textColor = '';
            if (this._rootParent) {
                const rowStyles = window.getComputedStyle(this._rootParent, null);
                textColor = rowStyles === null || rowStyles === void 0 ? void 0 : rowStyles.color;
            }
            return textColor || this.getDefaultTextColor();
        }
        getDefaultThemeColor() {
            return this.theme === 'light' ? lightTheme.background.main : darkTheme.background.main;
        }
        getDefaultTextColor() {
            return this.theme === 'light' ? lightTheme.text.primary : darkTheme.text.primary;
        }
        onToggleEditor(value) {
            var _a;
            this.mdEditor.visible = value;
            this.setAttribute('contenteditable', `${value}`);
            this.mdViewer.visible = !value;
            this.pnlEmpty.visible = !value;
            if (value) {
                const editorElm = this.mdEditor.getEditorElm();
                if (editorElm)
                    editorElm.focus();
            }
            else {
                const newVal = (_a = this.mdEditor) === null || _a === void 0 ? void 0 : _a.getMarkdownValue();
                this.mdViewer.value = newVal;
                this.toggleEmpty(!newVal);
                if (newVal !== this._data)
                    this.onConfirm();
            }
        }
        async init() {
            super.init();
            const width = this.getAttribute('width', true);
            const height = this.getAttribute('height', true);
            const backgroundColor = this.getBackgroundColor();
            const textColor = this.getTextColor();
            const initTag = { backgroundColor, textColor, textAlign: 'left', settingBgColor: '' };
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
                if (themeAttr)
                    this.theme = themeAttr;
                const data = this.getAttribute('data', true);
                if (data)
                    this.data = data;
            }
            const builder = this.closest('i-scom-page-builder');
            ;
            if (builder) {
                await this.renderEditor();
                this.addEventListener('blur', this.onBlurHandler);
                this.mdViewer.addEventListener("selectstart", () => {
                    this.setAttribute('contenteditable', 'false');
                    if (builder)
                        this.onToggleEditor(true);
                });
            }
            else {
                this.onHide();
            }
        }
        async renderEditor() {
            this.pnlEditorWrap.clearInnerHTML();
            this.mdEditor = await components_4.MarkdownEditor.create({
                viewer: false,
                value: this.data,
                width: '100%',
                height: 'auto',
                mode: 'wysiwyg',
                theme: this.theme,
                hideModeSwitch: true,
                toolbarItems: [],
                visible: false
            });
            this.mdEditor.id = 'mdEditor';
            this.pnlEditorWrap.appendChild(this.mdEditor);
        }
        onHide() {
            this.removeEventListener('blur', this.onBlurHandler);
        }
        onBlurHandler(event) {
            this.onToggleEditor(false);
        }
        _getActions() {
            const { dataSchema, jsonUISchema } = this.getThemeSchema();
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
                    command: (builder, userInputData) => {
                        let oldTag = {};
                        return {
                            execute: async () => {
                                if (!userInputData)
                                    return;
                                oldTag = JSON.parse(JSON.stringify(this.tag));
                                userInputData = userInputData || {};
                                if (userInputData.backgroundColor) {
                                    this.tag.backgroundColor = userInputData.backgroundColor;
                                    this.tag.settingBgColor = userInputData.backgroundColor;
                                }
                                this.tag = Object.assign(Object.assign({}, this.tag), userInputData);
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
                    userInputDataSchema: dataSchema,
                    userInputUISchema: jsonUISchema,
                }
            ];
            return actions;
        }
        resetStyles() {
            this.tag.textColor = this.getTextColor();
            this.tag.backgroundColor = this.getBackgroundColor();
            for (let i = this.classList.length - 1; i >= 0; i--) {
                const className = this.classList[i];
                if (className.startsWith('font-')) {
                    this.classList.remove(className);
                }
            }
            this.style.removeProperty('--custom-text-color');
            this.style.removeProperty('--custom-background-color');
        }
        updateMarkdown(config) {
            if (!config)
                return;
            const { width, height, textAlign = 'left' } = config;
            this.renderSettings();
            if (this.pnlMarkdownEditor) {
                this.pnlMarkdownEditor.style.textAlign = textAlign;
            }
            if (this.mdViewer) {
                if (width)
                    this.mdViewer.width = width;
                if (height)
                    this.mdViewer.height = 'auto'; // height;
            }
        }
        renderSettings() {
            const { customBackgroundColor, backgroundColor, customTextColor, textColor, customTextSize, textSize } = this.tag || {};
            for (let i = this.classList.length - 1; i >= 0; i--) {
                const className = this.classList[i];
                if (className.startsWith('font-')) {
                    this.classList.remove(className);
                }
            }
            if (customTextColor && textColor)
                this.style.setProperty('--custom-text-color', textColor);
            else
                this.style.removeProperty('--custom-text-color');
            if (customBackgroundColor && backgroundColor)
                this.style.setProperty('--custom-background-color', backgroundColor);
            else
                this.style.removeProperty('--custom-background-color');
            if (customTextSize && textSize)
                this.classList.add(`font-${textSize}`);
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
            if (this.mdViewer) {
                this.mdViewer.value = this._data;
            }
            if (this.mdEditor) {
                this.mdEditor.value = this._data;
            }
        }
        getTag() {
            return this.tag;
        }
        async setTag(value, fromParent) {
            if (fromParent) {
                this.resetStyles();
                return;
            }
            const newValue = value || {};
            for (let prop in newValue) {
                if (newValue.hasOwnProperty(prop)) {
                    if (prop === 'width' || prop === 'height') {
                        this.tag[prop] = typeof newValue[prop] === 'string' ? newValue[prop] : `${newValue[prop]}px`;
                    }
                    else if (prop === 'backgroundColor') {
                        this.tag.backgroundColor = newValue.backgroundColor || this.getBackgroundColor();
                    }
                    else if (prop === 'textColor') {
                        this.tag.textColor = newValue.textColor || this.getTextColor();
                    }
                    else
                        this.tag[prop] = newValue[prop];
                }
            }
            // this.height = this.tag?.height || 'auto';
            this.height = 'auto';
            this.updateMarkdown(Object.assign({}, this.tag));
        }
        getEditCommand(builder, content) {
            let _oldData = '';
            return {
                execute: async () => {
                    _oldData = this._data;
                    await this.setData({ content });
                    if (builder === null || builder === void 0 ? void 0 : builder.setData)
                        builder.setData({ content });
                },
                undo: async () => {
                    await this.setData({ content: _oldData });
                    if (builder === null || builder === void 0 ? void 0 : builder.setData)
                        builder.setData({ content: _oldData });
                },
                redo: () => { }
            };
        }
        setOnConfirm(commandHistory, builder) {
            this.commandHistory = commandHistory;
            this.builder = builder;
        }
        onConfirm() {
            var _a;
            if (!this.commandHistory)
                return;
            const newContent = (_a = this.mdEditor) === null || _a === void 0 ? void 0 : _a.getMarkdownValue();
            const editCommand = this.getEditCommand(this.builder, newContent);
            this.commandHistory.execute(editCommand);
        }
        getConfigurators() {
            return [
                {
                    name: 'Builder Configurator',
                    target: 'Builders',
                    getActions: () => {
                        return this._getActions();
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
            const dataSchema = {
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
                    "customBackgroundColor": {
                        "title": "Custom background color",
                        "type": "boolean"
                    },
                    "backgroundColor": {
                        "title": "Background color",
                        "type": "string",
                        "format": "color"
                    },
                    "customTextColor": {
                        "title": "Custom text color",
                        "type": "boolean"
                    },
                    "textColor": {
                        "title": "Text color",
                        "type": "string",
                        "format": "color"
                    },
                    "customTextSize": {
                        "title": "Custom text size",
                        "type": "boolean"
                    },
                    "textSize": {
                        "title": "Text size",
                        "type": "string",
                        "oneOf": [
                            { "title": "Extra Small", "const": "xs" },
                            { "title": "Small", "const": "sm" },
                            { "title": "Normal", "const": "md" },
                            { "title": "Large", "const": "lg" },
                            { "title": "Extra Large", "const": "xl" }
                        ]
                    }
                }
            };
            const jsonUISchema = {
                "type": "VerticalLayout",
                "elements": [
                    {
                        "type": "HorizontalLayout",
                        "elements": [
                            {
                                "type": "Control",
                                "scope": "#/properties/textAlign"
                            }
                        ]
                    },
                    {
                        "type": "HorizontalLayout",
                        "elements": [
                            {
                                "type": "Control",
                                "scope": "#/properties/customBackgroundColor"
                            },
                            {
                                "type": "Control",
                                "scope": "#/properties/backgroundColor",
                                "rule": {
                                    "effect": "ENABLE",
                                    "condition": {
                                        "scope": "#/properties/customBackgroundColor",
                                        "schema": {
                                            "const": true
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "type": "HorizontalLayout",
                        "elements": [
                            {
                                "type": "Control",
                                "scope": "#/properties/customTextColor"
                            },
                            {
                                "type": "Control",
                                "scope": "#/properties/textColor",
                                "rule": {
                                    "effect": "ENABLE",
                                    "condition": {
                                        "scope": "#/properties/customTextColor",
                                        "schema": {
                                            "const": true
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        "type": "HorizontalLayout",
                        "elements": [
                            {
                                "type": "Control",
                                "scope": "#/properties/customTextSize"
                            },
                            {
                                "type": "Control",
                                "scope": "#/properties/textSize",
                                "rule": {
                                    "effect": "ENABLE",
                                    "condition": {
                                        "scope": "#/properties/customTextSize",
                                        "schema": {
                                            "const": true
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ]
            };
            return { dataSchema, jsonUISchema };
        }
        render() {
            return (this.$render("i-vstack", { id: "pnlMarkdownEditor", background: { color: `var(--custom-background-color, var(--background-main))` }, font: { color: `var(--custom-text-color, var(--text-primary))` } },
                this.$render("i-markdown-editor", { id: "mdViewer", viewer: true, value: this.data, width: '100%', height: 'auto', visible: false }),
                this.$render("i-panel", { id: "pnlEmpty" },
                    this.$render("i-label", { caption: "Click to edit text", opacity: 0.5, padding: { top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' } })),
                this.$render("i-panel", { id: "pnlEditorWrap" })));
        }
    };
    ScomMarkdownEditor = __decorate([
        components_4.customModule,
        (0, components_4.customElements)('i-scom-markdown-editor')
    ], ScomMarkdownEditor);
    exports.default = ScomMarkdownEditor;
});
