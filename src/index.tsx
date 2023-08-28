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
    MarkdownEditor
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
    backgroundColor?: string;
}

type ThemeType = 'dark' | 'light'
interface ScomMarkdownElement extends ControlElement {
    lazyLoad?: boolean;
    data?: string;
    theme?: ThemeType
}

declare global {
    namespace JSX {
        interface IntrinsicElements {
            ['i-scom-markdown-editor']: ScomMarkdownElement
        }
    }
}

@customModule
@customElements('i-scom-markdown-editor')
export default class ScomMarkdownEditor extends Module {
    private pnlMarkdownEditor: VStack;
    private pnlEmpty: Panel;
    private _rootParent: Control;
    private mdViewer: MarkdownEditor;
    private mdEditor: MarkdownEditor;
    private pnlEditorWrap: Panel;

    tag: any = {};
    defaultEdit: boolean = true;

    private _data: string;
    private _theme: ThemeType = 'light';
    private selectionTimer: any = null;
    private commandHistory: any = null;
    private builder: any;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
        if (scconfig) setDataFromSCConfig(scconfig);
        this.onSelectionHandler = this.onSelectionHandler.bind(this);
        this.onBlurHandler = this.onBlurHandler.bind(this);
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
        // if (this.pnlMarkdownEditor && !this.tag?.settingBgColor) {
        //     this.tag.backgroundColor = this.getBackgroundColor();
        // }
        this.tag.textColor = this.getTextColor();
        this.tag.backgroundColor = this.getBackgroundColor();
        this.updateColor(this.tag.textColor, this.tag.backgroundColor);
        if (this.mdViewer) this.mdViewer.theme = this.theme;
        if (this.mdEditor) this.mdEditor.theme = this.theme;
    }

    private setRootParent(parent: Control) {
        this._rootParent = parent;
        const newTag = {...this.tag, backgroundColor: this.getBackgroundColor()};
        this.setTag(newTag);
    }

    private getBackgroundColor() {
        let backgroundColor = '';
        if (this._rootParent) {
            // const rowStyles = window.getComputedStyle(this._rootParent, null);
            backgroundColor = this._rootParent.background.color // || rowStyles?.backgroundColor;
        }
        return backgroundColor || this.getDefaultThemeColor();
    }

    private getTextColor() {
        let textColor = '';
        if (this._rootParent) {
            const rowStyles = window.getComputedStyle(this._rootParent, null);
            textColor = this._rootParent.font.color || rowStyles?.color;
        }
        return textColor || this.getDefaultTextColor();
    }

    private getDefaultThemeColor() {
        return this.theme === 'light' ? lightTheme.background.main : darkTheme.background.main;
    }

    private getDefaultTextColor() {
        return this.theme === 'light' ? lightTheme.text.primary : darkTheme.text.primary;
    }

    private onToggleEditor(value: boolean) {
        this.mdEditor.visible = value;
        this.setAttribute('contenteditable', `${value}`);
        this.mdViewer.visible = !value;
        this.pnlEmpty.visible = !value;
        if (value) {
            const editorElm = this.mdEditor.getEditorElm();
            if (editorElm) editorElm.focus();
        } else {
            const newVal = this.mdEditor?.getMarkdownValue();
            this.mdViewer.value = newVal;
            this.toggleEmpty(!newVal);
            if (newVal !== this._data) this.onConfirm();
        }
    }

    async init() {
        super.init();
        const width = this.getAttribute('width', true);
        const height = this.getAttribute('height', true);
        const backgroundColor = this.getBackgroundColor();
        const textColor = this.getTextColor();
        const initTag: any = { backgroundColor, textColor, textAlign: 'left', settingBgColor: '' };
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
            if (themeAttr) this.theme = themeAttr;
            const data = this.getAttribute('data', true);
            if (data) this.data = data;
        }
        const builder = this.closest('i-scom-page-builder');
        // this.setAttribute('draggable', 'false');
        // this.setAttribute('contenteditable', 'false');
        if (builder) {
            await this.renderEditor();
            this.addEventListener('blur', this.onBlurHandler);
            // document.addEventListener('selectionchange', this.onSelectionHandler);
            this.mdViewer.addEventListener("selectstart", () => {
                this.setAttribute('contenteditable', 'false');
                if (builder) this.onToggleEditor(true);
            })
        } else {
            this.onHide();
        }
    }

    private async renderEditor() {
        this.pnlEditorWrap.clearInnerHTML();
        this.mdEditor = await MarkdownEditor.create({
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

    onHide(): void {
        this.removeEventListener('blur', this.onBlurHandler);
        // document.removeEventListener('selectionchange', this.onSelectionHandler);
    }

    private onSelectionHandler(event: Event) {
        event.preventDefault();
        event.stopPropagation();
        const selection = document.getSelection();
        const range = selection.rangeCount > 0 && selection.getRangeAt(0);
        if (!range) return;
        const nearestContainer = range.commonAncestorContainer.TEXT_NODE ? range.commonAncestorContainer.parentElement : range.commonAncestorContainer;
        const parentBuilder = nearestContainer.parentElement?.closest('i-scom-page-builder')
        if (!parentBuilder) return;
        const parentEditor = nearestContainer.parentElement?.closest('#mdEditor');
        const editor = nearestContainer.parentElement?.closest('i-scom-markdown-editor');
        const isDragging = parentEditor?.closest('ide-toolbar')?.classList.contains('to-be-dropped');
        if (!selection.toString() && !editor) {
            this.resetEditors();
            return;
        }
        if (parentEditor || isDragging || !selection.toString()) return;

        if (this.selectionTimer) clearTimeout(this.selectionTimer);
        this.selectionTimer = setTimeout(() => {
            const selection = document.getSelection();
            this.resetEditors();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const commonAncestorContainer = range.commonAncestorContainer;
                const nearestContainer = commonAncestorContainer.TEXT_NODE ? commonAncestorContainer.parentElement : commonAncestorContainer as HTMLElement;
                const startContainer = range.startContainer.parentElement.closest('i-scom-markdown-editor');
                const endContainer = range.endContainer.parentElement.closest('i-scom-markdown-editor');
                const nearestEditor = nearestContainer && nearestContainer.closest('i-scom-markdown-editor');
                const parentEditor = (nearestEditor || startContainer || endContainer) as ScomMarkdownEditor;
                if (parentEditor) {
                    const isDragging = parentEditor?.closest('ide-toolbar')?.classList.contains('to-be-dropped');
                    if (parentEditor && !isDragging) {
                        parentEditor.onToggleEditor(true);
                    }
                }
            }
        }, 500)
    }

    private onBlurHandler(event: Event) {
        this.onToggleEditor(false)
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
                            if (userInputData.backgroundColor) {
                                this.tag.backgroundColor = userInputData.backgroundColor;
                                this.tag.settingBgColor = userInputData.backgroundColor
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
        const { width, height, backgroundColor, textAlign = 'left', textColor } = config;
        this.updateColor(textColor, backgroundColor);
        if (this.pnlMarkdownEditor) {
            this.pnlMarkdownEditor.style.textAlign = textAlign;
        }
        if (this.mdViewer) {
            if (width) this.mdViewer.width = width;
            if (height) this.mdViewer.height = 'auto'; // height;
        }
    }

    private updateColor(textColor: string, backgroundColor: string) {
        if (textColor) this.style.setProperty('--editor-font_color', textColor);
        else this.style.removeProperty('--editor-font_color');
        if (backgroundColor) this.style.setProperty('--editor-background', backgroundColor);
        else this.style.removeProperty('--editor-background');
    }

    private getData() {
        return { content: this.data };
    }

    private toggleEmpty(value: boolean) {
        this.pnlEmpty.visible = value;
        this.mdViewer.visible = !value;
    }

    private async setData(value: any) {
        this._data = value.content || '';
        this.toggleEmpty(!this._data);
        if (this.mdViewer) {
            this.mdViewer.value = this._data;
        }
        if (this.mdEditor) {
            this.mdEditor.value = this._data;
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
                } else if (prop === 'backgroundColor') {
                    // this.tag.backgroundColor = newValue?.settingBgColor || this.getBackgroundColor();
                    this.tag.backgroundColor = newValue.backgroundColor || this.getBackgroundColor();
                } else if (prop === 'textColor') {
                    const isNew = newValue?.textColor && newValue.textColor !== this.tag.textColor;
                    this.tag.textColor = isNew ? newValue.textColor : this.getTextColor();
                }
                else this.tag[prop] = newValue[prop];
            }
        }
        // this.height = this.tag?.height || 'auto';
        this.height = 'auto'
        this.updateMarkdown({...this.tag});
    }

    private getEditCommand(builder: any, content: string) {
        let _oldData = '';
        return {
            execute: async () => {
                _oldData = this._data;
                await this.setData({content});
                if (builder?.setData) builder.setData({content});
            },
            undo: async () => {
                await this.setData({content: _oldData});
                if (builder?.setData) builder.setData({content: _oldData});
            },
            redo: () => { }
        }
    }

    private setOnConfirm(commandHistory: any, builder: any) {
        this.commandHistory = commandHistory;
        this.builder = builder;
    }

    private onConfirm() {
        if (!this.commandHistory) return;
        const newContent = this.mdEditor?.getMarkdownValue();
        const editCommand = this.getEditCommand(this.builder, newContent);
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
                backgroundColor: {
                    type: 'string',
                    format: 'color'
                }
            }
        }
        return themeSchema;
    }

    render() {
        return (
            <i-vstack id="pnlMarkdownEditor" background={{color: Theme.editor.background}}>
                <i-markdown-editor
                    id="mdViewer"
                    viewer={true}
                    value = {this.data}
                    width='100%'
                    height='auto'
                    visible={false}
                ></i-markdown-editor>
                <i-panel id="pnlEmpty">
                    <i-label
                        caption="Click to edit text"
                        opacity={0.5}
                        font={{color: Theme.editor.fontColor}}
                        padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
                    ></i-label>
                </i-panel>
                <i-panel id="pnlEditorWrap"></i-panel>
            </i-vstack>
        );
    }
}
