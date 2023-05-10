import {
    Module,
    Panel,
    customModule,
    MarkdownEditor,
    VStack,
    Input,
    HStack,
    Container,
    Button,
    Styles,
    Control,
    customElements,
    ControlElement,
    IDataSchema
} from '@ijstech/components';
import './index.css';
import { IConfigSchema, PageBlock } from './interface';
import { fetchAIGeneratedText } from './API';
import { setDataFromSCConfig } from './store';
import scconfig from './data.json';
const Theme = Styles.Theme.ThemeVars;

export interface IConfigData {
    width?: string;
    height?: string;
    background?: string;
}

// const configSchema: IConfigSchema = {
//     type: 'object',
//     properties: {
//         width: {
//             type: 'string',
//         },
//         height: {
//             type: 'string',
//         },
//         background: {
//             type: 'string',
//         }
//     }
// }
type ThemeType = 'dark'|'light'
interface ScomMarkdownElement extends ControlElement {
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
    private oldData: any;
    private pnlMarkdownEditor: VStack;
    private pnlEditor: Panel;
    private pnlViewer: Panel;
    private pnlAIPrompt: HStack;
    private inputAIPrompt: Input;
    private mdEditor: MarkdownEditor;
    private mdViewer: MarkdownEditor;
    private btnStop: Button;
    private btnSend: Button;
    private pnlWaiting: Panel;
    private oldTag: any = {};
    tag: any = {};
    defaultEdit: boolean = true;
    private isEditing: boolean = false;
    private isStopped: boolean = false;
    private oldContent: string = '';

    private _data: string;
    private _editMode: boolean = false;
    private _theme: ThemeType = 'light';

    readonly onEdit: () => Promise<void>;
    readonly onConfirm: () => Promise<void>;
    readonly onDiscard: () => Promise<void>;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
        if (scconfig)
          setDataFromSCConfig(scconfig);
    }

    static async create(options?: ScomMarkdownElement, parent?: Container){
        let self = new this(parent, options);
        await self.ready();
        return self;
    }

    get data() {
        return this._data
    }
    set data(value: string) {
        this._data = value;
        this.setData({content: value});
    }

    get editMode() {
        return this._editMode
    }
    set editMode(value: boolean) {
        this._editMode = value;
        this.isEditing = value;
        if (this.pnlEditor) {
            this.pnlEditor.visible = this.pnlAIPrompt.visible = this.isEditing;
            if (!this.mdEditor) this.renderEditor();
        }
        if (this.pnlViewer)
            this.pnlViewer.visible = !this.isEditing;
    }

    get theme() {
        return this._theme
    }
    set theme(value: ThemeType) {
        this._theme = value;
        if (this.mdEditor)
            this.mdEditor.theme = value
        if (this.mdViewer)
            this.mdViewer.theme = value
    }

    init() {
        super.init();
        const width = this.getAttribute('width', true);
        const height = this.getAttribute('height', true);
        if (width || height) {
            const finalWidth = width ? (typeof this.width === 'string' ? width : `${width}px`) : '100%';
            const finalHeight = height ? (typeof this.height === 'string' ? height : `${height}px`) : 'auto';
            this.setTag({width: finalWidth, height: finalHeight});
        }
        const themeAttr = this.getAttribute('theme', true);
        if (themeAttr) this.theme = themeAttr
        this.editMode = this.getAttribute('editMode', true, false);
        const data = this.getAttribute('data', true, '');
        (!data) && this.renderEmptyPnl();
        this.data = data;
    }

    // getConfigSchema() {
    //     return configSchema;
    // }

    private preventDrag(builder: Control, value: boolean) {
        if (!builder) return;
        const section = builder.closest('ide-section') as Control;
        section && (section.style.height = 'auto');
        if (value)
            builder.classList.add('is-editing');
        else
            builder.classList.remove('is-editing');
    }

    private _getActions(themeSchema?: IDataSchema) {
        const actions = [
            {
                name: 'Edit',
                icon: 'edit',
                visible: () => !this.isEditing,
                command: (builder: any, userInputData: any) => {
                    return {
                        execute: () => {
                            this.edit();
                            this.preventDrag(builder, true);
                        },
                        undo: () => {
                        },
                        redo: () => {}
                    }
                },
                userInputDataSchema: {}
            },
            {
                name: 'Theme Settings',
                icon: 'palette',
                visible: () => !this.isEditing && themeSchema != null && themeSchema != undefined,
                command: (builder: any, userInputData: any) => {
                    return {
                        execute: async () => {
                            if (!userInputData) return;
                            this.oldTag = { ...this.tag };
                            this.setTag(userInputData);
                            if (builder) builder.setTag(userInputData);
                        },
                        undo: () => {
                            if (!userInputData) return;
                            this.setTag(this.oldTag);
                            if (builder) builder.setTag(this.oldTag);
                        },
                        redo: () => { }
                    }
                },
                userInputDataSchema: themeSchema
            },
            {
                name: 'Confirm',
                icon: 'check',
                visible: () => this.isEditing,
                command: (builder: any, userInputData: any) => {
                    return {
                        execute: () => {
                            const isChanged = this.mdEditor?.getMarkdownValue() !== this.data;
                            if (this.oldContent && !isChanged && this.mdEditor)
                                this.mdEditor.value = this.oldContent;
                            this.oldData = this.data;
                            this.confirm();
                            if (this.mdViewer) this.mdViewer.value = this.data;
                            this.preventDrag(builder, false);
                        },
                        undo: () => {
                            const currentData = this.data;
                            this.edit();
                            this.oldContent = (this.mdEditor?.getMarkdownValue() || '');
                            if (this.mdEditor) this.mdEditor.value = this.oldData;
                            this.setData({ content: this.oldData });
                            this.oldData = currentData;
                            this.preventDrag(builder, true);
                            builder && builder.setData({content: this.data});
                        },
                        redo: () => {}
                    }
                },
                userInputDataSchema: {}
            },
            {
                name: 'Discard',
                icon: 'times',
                visible: () => this.isEditing,
                command: (builder: any, userInputData: any) => {
                    return {
                        execute: () => {
                            this.oldData = this.mdEditor?.getMarkdownValue() || '';
                            this.discard();
                            this.preventDrag(builder, false);
                        },
                        undo: () => {
                            this.edit();
                            if (this.mdEditor) this.mdEditor.value = this.oldData;
                            this.preventDrag(builder, true);
                        },
                        redo: () => {}
                    }
                },
                userInputDataSchema: {}
            }
        ];
        return actions;
    }

    // async onConfigSave(config: IConfigData) {
    //     this.tag = config;
    //     this.updateMarkdown(config);
    // }

    private updateMarkdown(config: IConfigData) {
        if (!config) return;
        const { width, height, background } = config;
        if (this.pnlMarkdownEditor) {
            this.pnlMarkdownEditor.background.color = background;
        }
        if (this.mdEditor) {
            if (width) this.mdEditor.width = width;
            if (height) this.mdEditor.height = height;
        }
        if (this.mdViewer) {
            if (width) this.mdViewer.width = width;
            // Using style because mode view doesnt have height attribute
            if (height) this.mdViewer.style.height = height;
        }
    }

    private getData() {
        return {
            content: this.data
        };
    }

    private renderEmptyPnl() {
        this.pnlViewer.clearInnerHTML();
        if (this.pnlViewer.visible)
            this.pnlViewer.appendChild(
                <i-label
                    caption="Click to edit text"
                    opacity={0.5} display="block"
                    padding={{top: '0.5rem', bottom: '0.5rem', left: '0.5rem', right: '0.5rem'}}
                ></i-label>
            );
    }

    private async setData(value: any) {
        this._data = value.content || '';
        // this.setTag({width: value.width, height: value.height});
        this.pnlEditor.visible = this.pnlAIPrompt.visible = this.isEditing;
        this.pnlViewer.visible = !this.isEditing;
        if (!this.data) {
            this.renderEmptyPnl();
            return;
        };
        const { width = '100%', height = "auto" } = this.tag || {};
        if (!this.mdViewer) {
            this.mdViewer = await MarkdownEditor.create({
                viewer: true,
                value: this.data,
                width,
                height,
                theme: this.theme
            });
            this.mdViewer.display = 'block';
            if (height) this.mdViewer.style.height = height;
            this.pnlViewer.clearInnerHTML();
            this.pnlViewer.appendChild(this.mdViewer);
        } else {
            this.pnlViewer.clearInnerHTML();
            this.pnlViewer.appendChild(this.mdViewer);
            this.mdViewer.value = this.data;
        }
    }

    private getTag() {
        return this.tag;
    }

    private async setTag(value: any) {
        let { width, height, background, textAlign } = value;
        width = typeof width === 'string' ? width : `${width}px`;
        height = typeof height === 'string' ? height : `${height}px`;
        if (height !== 'auto') this.height = 'auto';
        this.tag = { width, height, background, textAlign };
        this.pnlViewer.style.textAlign = textAlign || "left";
        this.updateMarkdown(value);
    }

    getConfigurators() {
        return [
            {
                name: 'Builder Configurator',
                target: 'Builders',
                getActions: () => {
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
                            }
                        }
                    }
                    return this._getActions(themeSchema)
                },
                getData: this.getData.bind(this),
                setData: async (data: any) => {
                    const defaultData = scconfig.defaultBuilderData as any;
                    await this.setData({...defaultData, ...data})
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

    private async edit() {
        // this.pnlEditor.visible = true;
        // this.pnlViewer.visible = false;
        this.isEditing = true;
        this.renderEditor();
    }

    private async confirm() {
        // this.pnlEditor.visible = false;
        // this.pnlViewer.visible = true;
        this.isEditing = false;
        await this.setData({
            content: this.mdEditor?.getMarkdownValue() || ''
        });
        const builder = this.parent?.closest('ide-toolbar') as any;
        builder && builder.setData({content: this.data});
    }

    private async discard() {
        // this.pnlEditor.visible = false;
        // this.pnlViewer.visible = true;
        this.isEditing = false;
        await this.setData({
            content: this.data
        });
        const builder = this.parent?.closest('ide-toolbar') as any;
        builder && builder.setData({content: this.data});
    }

    // private validate() {
    //     if (this.mdEditor && this.mdEditor.getMarkdownValue()) {
    //         return true;
    //     }
    //     return false;
    // }

    private async renderEditor() {
        const { width = '100%', height = "auto" } = this.tag;
        if (!this.mdEditor) {
            this.mdEditor = await MarkdownEditor.create({
                value: this.data,
                mode: 'wysiwyg',
                width,
                height,
                theme: this.theme
            });
            this.mdEditor.display = 'block';
            this.pnlEditor.clearInnerHTML();
            this.pnlEditor.appendChild(this.mdEditor);
        }
        this.mdEditor.value = this.data;
        this.pnlEditor.visible = this.pnlAIPrompt.visible = this.isEditing;
        this.pnlViewer.visible = !this.isEditing;
    }

    private toggleStopBtn(value: boolean) {
        this.btnStop.visible = value;
        this.btnSend.visible = !value;
        this.pnlWaiting.visible = value;
        this.inputAIPrompt.visible = !value;
    }

    private async readAllChunks(readableStream: ReadableStream) {
        const reader = readableStream.getReader();
        let done: boolean;
        let value: Uint8Array;
        while (!done) {
            ({ value, done } = await reader.read());
            const valueString = new TextDecoder().decode(value);
            const lines = valueString.split('\n').filter(line => line.trim() !== '');
            for (const line of lines) {
                if (this.isStopped) break;
                const message = line.replace(/^data: /, '');
                if (message === '[DONE]') return;
                try {
                    const parsedMessage = JSON.parse(message);
                    const text = parsedMessage.choices[0].text;
                    this.mdEditor.value = (this.mdEditor?.getMarkdownValue() || '') + text;
                } catch(error) {
                    console.error('Could not JSON parse stream message', message, error);
                }
            }
        }
    }

    private async sendAIPrompt() {
        this.isStopped = false;
        if (!this.inputAIPrompt.value) return;
        this.toggleStopBtn(true);
        try {
            const result = await fetchAIGeneratedText(this.inputAIPrompt.value);
            // console.log('answer', answer);
            if (!this.isStopped) await this.readAllChunks(result);
        } catch {
        }
        this.inputAIPrompt.value = '';
        this.toggleStopBtn(false);
    }

    private async stopAPIPrompt() {
        this.isStopped = true;
        this.inputAIPrompt.value = '';
        this.toggleStopBtn(false);
    }

    render() {
        return (
            <i-vstack id="pnlMarkdownEditor">
                <i-panel id={'pnlEditor'} padding={{ top: "0.5rem", bottom: "0.5rem", left: "1rem", right: "1rem" }} />
                <i-hstack id={'pnlAIPrompt'} width="100%" horizontalAlignment="space-between" verticalAlignment="center" padding={{ top: "0.5rem", bottom: "0.5rem", left: "1rem", right: "1rem" }}>
                    <i-vstack width="90%">
                        <i-hstack
                            id="pnlWaiting"
                            gap={4} verticalAlignment="center"
                            minHeight={32} width="100%" height="auto"
                            border={{width: '0.5px', style: 'solid', color: Theme.divider}}
                            background={{color: Theme.input.background}}
                            padding={{left: '10px'}}
                            visible={false}
                        >
                            <i-label font={{ size: '1.5rem', color: Theme.input.fontColor }} caption="AI is writing"></i-label>
                            <i-hstack gap={4} verticalAlignment="center" class="typing">
                                <i-icon name="circle" width={4} height={4} fill={Theme.input.fontColor}></i-icon>
                                <i-icon name="circle" width={4} height={4} fill={Theme.input.fontColor}></i-icon>
                                <i-icon name="circle" width={4} height={4} fill={Theme.input.fontColor}></i-icon>
                            </i-hstack>
                        </i-hstack>
                        <i-input id="inputAIPrompt" placeholder="Ask AI to edit or generate..." font={{ size: '1.5rem' }} height="auto" width="100%"></i-input>
                    </i-vstack>
                    <i-button id="btnStop" caption="Stop" width="10%" visible={false} font={{ color: 'rgba(255,255,255)' }} padding={{ top: "0.5rem", bottom: "0.5rem", left: "1rem", right: "1rem" }} onClick={this.stopAPIPrompt}></i-button>
                    <i-button id="btnSend" caption="Send" width="10%" font={{ color: 'rgba(255,255,255)' }} padding={{ top: "0.5rem", bottom: "0.5rem", left: "1rem", right: "1rem" }} onClick={this.sendAIPrompt}></i-button>
                </i-hstack>           
                <i-panel id={'pnlViewer'} minHeight={20}/>
            </i-vstack>
        );
    }
}
