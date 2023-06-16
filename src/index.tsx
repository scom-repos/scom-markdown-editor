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
    IDataSchema
} from '@ijstech/components';
import './index.css';
import { setDataFromSCConfig } from './store';
import scconfig from './data.json';
import Config from './editor/index';

const Theme = Styles.Theme.ThemeVars;

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
        return this._theme
    }
    set theme(value: ThemeType) {
        this._theme = value;
        if (this.mdViewer)
            this.mdViewer.theme = value
    }

    async init() {
        super.init();
        const width = this.getAttribute('width', true);
        const height = this.getAttribute('height', true);
        if (width || height) {
            const finalWidth = width ? (typeof this.width === 'string' ? width : `${width}px`) : '100%';
            const finalHeight = height ? (typeof this.height === 'string' ? height : `${height}px`) : 'auto';
            this.setTag({ width: finalWidth, height: finalHeight });
        }
        const lazyLoad = this.getAttribute('lazyLoad', true, false);
        if (!lazyLoad) {
            const themeAttr = this.getAttribute('theme', true);
            if (themeAttr) this.theme = themeAttr
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
                            theme: this.theme
                        });
                        const button = new Button(null, {
                            caption: 'Confirm',
                            background: {color: Theme.colors.primary.main},
                            font: {color: Theme.colors.primary.contrastText}
                        });
                        vstack.append(config);
                        vstack.append(button);
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
                    let oldTag = {};
                    return {
                        execute: async () => {
                            if (!userInputData) return;
                            oldTag = { ...this.tag };
                            this.setTag(userInputData);
                            if (builder) builder.setTag(userInputData);
                        },
                        undo: () => {
                            if (!userInputData) return;
                            this.setTag(oldTag);
                            if (builder) builder.setTag(oldTag);
                        },
                        redo: () => { }
                    }
                },
                userInputDataSchema: themeSchema
            }
        ];
        return actions;
    }

    private updateMarkdown(config: IConfigData) {
        if (!config) return;
        const { width, height, background } = config;
        if (this.pnlMarkdownEditor) {
            this.pnlMarkdownEditor.background.color = background;
        }
        // TODO: update data
        // if (this.mdEditor) {
        //     if (width) this.mdEditor.width = width;
        //     if (height) this.mdEditor.height = height;
        //     const container = this.mdEditor.querySelector('.toastui-editor-ww-container') as HTMLElement;
        //     if (container) {
        //         container.style.background = background;
        //     }
        // }
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
        let { width, height, background, textAlign } = value;
        width = typeof width === 'string' ? width : `${width}px`;
        height = typeof height === 'string' ? height : `${height}px`;
        this.height = height || 'auto';
        this.tag = { width, height, background, textAlign };
        this.pnlMarkdownEditor.style.textAlign = textAlign || "left";
        this.updateMarkdown(value);
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
