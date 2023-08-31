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
    MarkdownEditor,
    IUISchema
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
    private commandHistory: any = null;
    private builder: any;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
        if (scconfig) setDataFromSCConfig(scconfig);
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
        // this.tag.textColor = this.getTextColor();
        // this.tag.backgroundColor = this.getBackgroundColor();
        // this.renderSettings(this.tag.textColor, this.tag.backgroundColor);
        if (this.mdViewer) this.mdViewer.theme = this.theme;
        if (this.mdEditor) this.mdEditor.theme = this.theme;
    }

    private setRootParent(parent: Control) {
        this._rootParent = parent;
        const newTag = {...this.tag, backgroundColor: this.getBackgroundColor()};
        this.setTag(newTag, true);
    }

    private getBackgroundColor() {
        let backgroundColor = '';
        if (this._rootParent) {
            const rowStyles = window.getComputedStyle(this._rootParent, null);
            backgroundColor = rowStyles?.backgroundColor;
        }
        return backgroundColor || this.getDefaultThemeColor();
    }

    private getTextColor() {
        let textColor = '';
        if (this._rootParent) {
            const rowStyles = window.getComputedStyle(this._rootParent, null);
            textColor = rowStyles?.color;
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
        const builder = this.closest('i-scom-page-builder');;
        if (builder) {
            await this.renderEditor();
            this.addEventListener('blur', this.onBlurHandler);
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
    }

    private onBlurHandler(event: Event) {
        this.onToggleEditor(false)
    }

    private _getActions() {
        const { dataSchema, jsonUISchema } = this.getThemeSchema()
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
                command: (builder: any, userInputData: any) => {
                    let oldTag: any = {};
                    return {
                        execute: async () => {
                            if (!userInputData) return;
                            oldTag = JSON.parse(JSON.stringify(this.tag));
                            userInputData = userInputData || {}
                            if (userInputData.backgroundColor) {
                                this.tag.backgroundColor = userInputData.backgroundColor;
                                this.tag.settingBgColor = userInputData.backgroundColor
                            }
                            this.tag = {...this.tag, ...userInputData};
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
                userInputDataSchema: dataSchema,
                userInputUISchema: jsonUISchema,
            }
        ];
        return actions;
    }

    private resetStyles() {
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

    private updateMarkdown(config: any) {
        if (!config) return;
        const { width, height, textAlign = 'left' } = config;
        this.renderSettings();
        if (this.pnlMarkdownEditor) {
            this.pnlMarkdownEditor.style.textAlign = textAlign;
        }
        if (this.mdViewer) {
            if (width) this.mdViewer.width = width;
            if (height) this.mdViewer.height = 'auto'; // height;
        }
    }

    private renderSettings() {
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
            this.classList.add(`font-${textSize}`)
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

    private async setTag(value: any, fromParent?: boolean) {
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
                } else if (prop === 'textColor') {
                    this.tag.textColor = newValue.textColor || this.getTextColor();
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
                    return this._getActions()
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
        const dataSchema: IDataSchema = {
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
                        {"title": "Extra Small", "const": "xs"},
                        {"title": "Small", "const": "sm"},
                        {"title": "Normal", "const": "md"},
                        {"title": "Large", "const": "lg"},
                        {"title": "Extra Large", "const": "xl"}
                    ]
                }
            }
        }

        const jsonUISchema: IUISchema = {
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
        }

        return { dataSchema, jsonUISchema };
    }

    render() {
        return (
            <i-vstack
                id="pnlMarkdownEditor"
                background={{color: `var(--custom-background-color, var(--background-main))`}}
                font={{color: `var(--custom-text-color, var(--text-primary))`}}
            >
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
                        padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
                    ></i-label>
                </i-panel>
                <i-panel id="pnlEditorWrap"></i-panel>
            </i-vstack>
        );
    }
}
