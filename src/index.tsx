import {
    Module,
    Panel,
    customModule,
    VStack,
    Container,
    Button,
    Styles,
    customElements,
    ControlElement,
    IDataSchema,
    Control,
    HStack,
    RequireJS
} from '@ijstech/components';
import './index.css';
import { setDataFromSCConfig } from './store';
import scconfig from './data.json';
import Config from './editor/index';

const Theme = Styles.Theme.ThemeVars;
const lightTheme = Styles.Theme.defaultTheme;
const darkTheme = Styles.Theme.darkTheme;

export interface IConfigData {
    width?: string;
    height?: string;
    background?: string;
}

type ThemeType = 'dark' | 'light'
interface ScomMarkdownElement extends ControlElement {
    lazyLoad?: boolean;
    data?: string;
    inline?: boolean;
    theme?: ThemeType
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-markdown-editor']: ScomMarkdownElement
        }
    }
}

const LibPath = `libs/@scom/scom-markdown-editor/`;
const TOOLBAR_ITEMS_DEFAULT = [
    ['heading', 'bold', 'italic', 'strike'],
    ['hr', 'quote'],
    ['ul', 'ol', 'task', 'indent', 'outdent'],
    ['table', 'image', 'link'],
    ['code', 'codeblock']
]
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

@customModule
@customElements('i-scom-markdown-editor')
export default class ScomMarkdownEditor extends Module {
    private pnlMarkdownEditor: VStack;
    private pnlEmpty: Panel;
    private pnlEditorWrap: Panel;
    private pnlEditor: Panel;
    private pnlViewerWrap: Panel;
    private pnlViewer: Panel;
    private _rootParent: Control;

    tag: any = {};
    defaultEdit: boolean = true;

    private editor: any;
    private editorPlugins: any[] = [];
    private mdViewer: any;
    private mdEditor: any;
    private _data: string;
    private _theme: ThemeType = 'light';
    private _inline: boolean = false;
    private selectionTimer: any = null;
    private commandHistory: any = null;
    private builder: any;
    private selectionPos = {
        start: null,
        end: null
    }

    constructor(parent?: Container, options?: any) {
        super(parent, options);
        if (scconfig) setDataFromSCConfig(scconfig);
        this.onSelectionHandler = this.onSelectionHandler.bind(this);
    }

    static async create(options?: ScomMarkdownElement, parent?: Container) {
        let self = new this(parent, options);
        await self.ready();
        return self;
    }

    get data() {
        return this._data
    }
    set data(value: string) {
        this._data = value;
        this.setData({ content: value });
    }

    get theme() {
        return this._theme ?? 'light';
    }
    set theme(value: ThemeType) {
        this._theme = value ?? 'light';
        if (this.pnlMarkdownEditor && !this.tag?.settingColor) {
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
        return this._inline ?? false;
    }
    set inline(value: boolean) {
        this._inline = value;
        if (this.inline && !this.mdEditor) {
            this.renderEditor();
        }
        this.pnlEditorWrap.visible = this.inline;
        if (this.inline) {
            this.classList.add('is-inline');
        } else {
            this.classList.remove('is-inline');
        }
    }

    private setRootParent(parent: Control) {
        this._rootParent = parent;
        const newTag = {...this.tag, background: this.getBackgroundColor()};
        this.setTag(newTag);
    }

    private getBackgroundColor() {
        let background = '';
        if (this._rootParent) {
            const rowStyles = window.getComputedStyle(this._rootParent, null);
            background = this._rootParent.background.color || rowStyles?.backgroundColor;
        }
        return background || this.getDefaultThemeColor();
    }

    private getDefaultThemeColor() {
        const bgByTheme = this.theme === 'light' ? lightTheme.background.main : darkTheme.background.main;
        return bgByTheme;
    }

    private async initPlugins() {
        try {
            for (const item of editorCSS) {
                this.addCSS(item.href, item.name);
            }
            await this.loadPlugins();
        } catch {}
    }

    private addCSS(href: string, name: string) {
        const css = document.head.querySelector(`[name="${name}"]`);
        if (css) return;
        let link = document.createElement('link');
        link.setAttribute('type', 'text/css');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('name', name);
        link.href = href;
        document.head.append(link);
    }

    private renderEditor(init?: boolean) {
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

    private renderViewer() {
        if (this.mdViewer) return;
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

    private async loadPlugin(plugin: string[]) {
        return new Promise((resolve, reject) => {
            RequireJS.require(plugin,
                async (
                    editor: any,
                    colorSyntax: any,
                    codeSyntaxHighlight: any,
                    tableMergedCell: any,
                    uml: any
                ) => {
                    this.editor = editor
                    resolve([colorSyntax, codeSyntaxHighlight, tableMergedCell, uml]);
                }
            );
        });
    }

    private async loadPlugins() {
        this.editorPlugins = await this.loadPlugin(libPlugins) as any[]
    }

    private onToggleEditor(value: boolean) {
        if (!this.inline) return;
        if (value) {
            this.pnlEditorWrap.visible = true;
            this.pnlViewerWrap.visible = false;
            this.pnlEditor.visible = true;
            const newVal = this.mdEditor?.getMarkdown() || this.data;
            this.mdEditor.setMarkdown(newVal);
        } else {
            this.pnlEditorWrap.visible = false;
            this.pnlViewerWrap.visible = true;
            this.pnlEditor.visible = false;
            const newVal = this.mdEditor?.getMarkdown() || this.data;
            this.mdViewer.setMarkdown(newVal);
            this.toggleEmpty(!newVal);
            if (newVal !== this.data) this.onConfirm();
        }
    }

    async init() {
        super.init();
        const width = this.getAttribute('width', true);
        const height = this.getAttribute('height', true);
        const background = this.getBackgroundColor();
        const initTag: any = { background, textAlign: 'left', settingColor: '' };
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
                this.setTag({
                    ...this.tag,
                    settingColor: '',
                    background
                });
            }
            await this.initPlugins();
            this.renderViewer();
            const data = this.getAttribute('data', true);
            if (data) this.data = data;
            this.inline = this.getAttribute('inline', true, false);
        }
        this.setAttribute('draggable', 'false');
        document.addEventListener("selectionchange", this.onSelectionHandler);
    }

    private onSelectionHandler(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        const selection = document.getSelection();
        const range = selection.rangeCount && selection.getRangeAt(0);
        if (!range) return;
        const nearestContainer = range.commonAncestorContainer.TEXT_NODE ? range.commonAncestorContainer.parentElement : range.commonAncestorContainer;
        const parentEditor = nearestContainer.parentElement?.closest('#pnlEditorWrap');
        const editor = nearestContainer.parentElement?.closest('i-scom-markdown-editor');
        const isDragging = parentEditor?.closest('ide-toolbar')?.classList.contains('to-be-dropped');
        if (!selection.toString() && !editor) {
            this.resetEditors();
            return;
        }
        if (parentEditor || isDragging) return;

        if (this.selectionTimer) clearTimeout(this.selectionTimer);
        this.selectionTimer = setTimeout(() => {
            const selection = document.getSelection();
            const selectionText = selection.toString();
            this.resetEditors();
            if (selection && selection.rangeCount) {
                const range = selection.getRangeAt(0);
                const nearestContainer = range.commonAncestorContainer;
                if (nearestContainer.TEXT_NODE) {
                    const parentEditor = nearestContainer.parentElement?.closest('i-scom-markdown-editor') as ScomMarkdownEditor;
                    const isDragging = parentEditor?.closest('ide-toolbar')?.classList.contains('to-be-dropped');
                    if (parentEditor && !isDragging) {
                        parentEditor.onToggleEditor(true);
                        const startIndex = this.data.indexOf(selectionText);
                        this.mdEditor.setSelection(startIndex, selectionText.length);
                    }
                }
            }
        }, 500)
    }

    private resetEditors() {
        const editors = document.querySelectorAll('i-scom-markdown-editor');
        for (let editor of editors) {
            (editor as ScomMarkdownEditor).onToggleEditor(false);
        }
    }

    private _getActions(themeSchema?: IDataSchema) {
        const actions = [
            {
                name: 'Edit',
                icon: 'edit',
                visible: () => !this.inline,
                command: (builder: any, userInputData: any) => {
                    let _oldData = '';
                    return {
                        execute: async () => {
                            _oldData = this._data;
                            const content = userInputData.content;
                            await this.setData({content});
                            if (builder?.setData) builder.setData({content});
                        },
                        undo: async () => {
                            this._data = _oldData;
                            await this.setData({content: this._data});
                            if (builder?.setData) builder.setData({content: this._data});
                        },
                        redo: () => { }
                    }
                },
                customUI: {
                    render: (data?: any, onConfirm?: (result: boolean, data: any) => void) => {
                        const vstack = new VStack(null, { gap: '1rem' });
                        const pnlConfig = new VStack();
                        const config = new Config(pnlConfig, {
                            content: this._data,
                            theme: this.theme,
                            margin: {bottom: '1rem'}
                        });
                        config.background = {color: this.getBackgroundColor()}; // bg for editor parent
                        config.setTag({...this.tag});
                        const pnlButton = new HStack(undefined, {
                            justifyContent: 'end',
                            alignItems: 'center',
                            gap: 5
                        });
                        const button = new Button(pnlButton, {
                            caption: 'Confirm',
                            height: 40,
                            background: {color: Theme.colors.primary.main},
                            font: {color: Theme.colors.primary.contrastText}
                        });
                        vstack.append(pnlConfig);
                        vstack.append(pnlButton);
                        button.onClick = async () => {
                            const content = config.content;
                            if (onConfirm) onConfirm(true, {content});
                        }
                        return vstack;
                    }
                }
            },
            {
                name: 'Theme Settings',
                icon: 'palette',
                visible: () => themeSchema != null && themeSchema != undefined,
                command: (builder: any, userInputData: any) => {
                    let oldTag: any = {};
                    return {
                        execute: async () => {
                            if (!userInputData) return;
                            oldTag = JSON.parse(JSON.stringify(this.tag));
                            if (userInputData.background) {
                                this.tag.background = userInputData.background;
                                this.tag.settingColor = userInputData.background
                            }
                            if (userInputData.width)
                                this.tag.width = userInputData.width;
                            if (userInputData.height)
                                this.tag.height = userInputData.height;
                            if (userInputData.textAlign)
                                this.tag.textAlign = userInputData.textAlign;
                            if (builder) builder.setTag(this.tag);
                            else this.setTag(this.tag);
                        },
                        undo: () => {
                            if (!userInputData) return;
                            this.tag = JSON.parse(JSON.stringify(oldTag));
                            if (builder) builder.setTag(this.tag);
                            else this.setTag(this.tag);
                        },
                        redo: () => { }
                    }
                },
                userInputDataSchema: themeSchema
            }
        ];
        return actions;
    }

    private updateMarkdown(config: any) {
        if (!config) return;
        const { width, height, background, textAlign = 'left' } = config;
        if (this.pnlMarkdownEditor) {
            this.pnlMarkdownEditor.background.color = background;
            this.pnlMarkdownEditor.style.textAlign = textAlign;
        }
        if (this.mdViewer) {
            if (width) this.mdViewer.width = width;
            if (height) this.mdViewer.height = height;
        }
    }

    private getData() {
        return { content: this.data };
    }

    private toggleEmpty(value: boolean) {
        this.pnlEmpty.visible = value;
        this.pnlViewerWrap.visible = !value;
    }

    private async setData(value: any) {
        this._data = value.content || '';
        this.toggleEmpty(!this._data);
        if (this.mdViewer) {
            this.mdViewer.setMarkdown(this._data);
        }
    }

    private getTag() {
        return this.tag;
    }

    private async setTag(value: any) {
        const newValue = value || {};
        for (let prop in newValue) {
            if (newValue.hasOwnProperty(prop)) {
                if (prop === 'width' || prop === 'height') {
                    this.tag[prop] = typeof newValue[prop] === 'string' ? newValue[prop] : `${newValue[prop]}px`;
                } else if (prop === 'background') {
                    this.tag.background = newValue?.settingColor || this.getBackgroundColor();
                }
                else this.tag[prop] = newValue[prop];
            }
        }
        // this.height = this.tag?.height || 'auto';
        this.height = 'auto'
        this.updateMarkdown({...this.tag});
    }

    private getEditCommand(builder: any) {
        let _oldData = '';
        return {
            execute: async () => {
                _oldData = this._data;
                const content = this.mdEditor?.getMarkdown();
                await this.setData({content});
                if (builder?.setData) builder.setData({content});
            },
            undo: async () => {
                this._data = _oldData;
                await this.setData({content: this._data});
                if (builder?.setData) builder.setData({content: this._data});
            },
            redo: () => { }
        }
    }

    private setOnConfirm(commandHistory: any, builder: any) {
        this.commandHistory = commandHistory;
        this.builder = builder;
    }

    private onConfirm() {
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
                    return this._getActions(themeSchema)
                },
                getData: this.getData.bind(this),
                setData: async (data: any) => {
                    const defaultData = scconfig.defaultBuilderData as any;
                    await this.setData({ ...defaultData, ...data })
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
        ]
    }

    private getThemeSchema() {
        const themeSchema: IDataSchema = {
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
        }
        return themeSchema;
    }

    render() {
        return (
            <i-vstack id="pnlMarkdownEditor" minHeight={50}>
                <i-panel id="pnlEditorWrap" visible={false}>
                    <i-panel id="pnlEditor" />
                </i-panel>
                <i-vstack id="pnlViewerWrap" width="100%">
                    <i-panel id="pnlViewer" />
                    <i-panel id="pnlEmpty">
                        <i-label
                            caption="Click to edit text"
                            opacity={0.5}
                            font={{color: '#222'}}
                            padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
                        ></i-label>
                    </i-panel>
                </i-vstack>
            </i-vstack>
        );
    }
}
