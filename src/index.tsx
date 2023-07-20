import {
    Module,
    Panel,
    customModule,
    MarkdownEditor,
    VStack,
    Container,
    Button,
    Styles,
    customElements,
    ControlElement,
    IDataSchema,
    Control,
    HStack
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
    editMode?: boolean;
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
    private mdViewer: MarkdownEditor;

    tag: any = {};
    defaultEdit: boolean = true;

    private _data: string;
    private _theme: ThemeType = 'light';
    private _rootParent: Control;

    readonly onEdit: () => Promise<void>;
    readonly onConfirm: () => Promise<void>;
    readonly onDiscard: () => Promise<void>;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
        if (scconfig) setDataFromSCConfig(scconfig);
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
        if (this.mdViewer)
            this.mdViewer.theme = value
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
            this.data = this.getAttribute('data', true, '');
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
                userInputDataSchema: {},
                customUI: {
                    render: (data?: any, onConfirm?: (result: boolean, data: any) => void) => {
                        const vstack = new VStack();
                        const config = new Config(null, {
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
                        vstack.append(config);
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
        this.mdViewer.visible = !value;
    }

    private async setData(value: any) {
        this._data = value.content || '';
        this.toggleEmpty(!this._data);
        this.mdViewer.value = this.data;
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
        this.height = this.tag?.height || 'auto';
        this.updateMarkdown({...this.tag});
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
                setRootParent: this.setRootParent.bind(this)
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
            <i-vstack id="pnlMarkdownEditor">
                <i-panel id="pnlViewer" minHeight={20}>
                    <i-markdown-editor
                        id="mdViewer"
                        viewer={true}
                        value = {this.data}
                        width='100%'
                        height='auto'
                        visible={false}
                    ></i-markdown-editor>
                </i-panel>
                <i-panel id="pnlEmpty">
                    <i-label
                        caption="Click to edit text"
                        opacity={0.5}
                        font={{color: '#222'}}
                        padding={{ top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem' }}
                    ></i-label>
                </i-panel>
            </i-vstack>
        );
    }
}
