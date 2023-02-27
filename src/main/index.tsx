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
    Styles
} from '@ijstech/components';
import './index.css';
import { IConfigSchema, PageBlock } from '@markdown-editor/global';
import { fetchAIGeneratedText } from './API';
import { setDataFromSCConfig } from '@markdown-editor/store';
const Theme = Styles.Theme.ThemeVars;

export interface IConfigData {
    width?: string;
    height?: string;
    background?: string;
}

const configSchema: IConfigSchema = {
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
}

@customModule
export class MarkdownBlock extends Module implements PageBlock {
    private data: any;
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
    tag: any;
    defaultEdit: boolean = true;
    private isEditing: boolean = false;
    private isStopped: boolean = false;

    readonly onEdit: () => Promise<void>;
    readonly onConfirm: () => Promise<void>;
    readonly onDiscard: () => Promise<void>;

    constructor(parent?: Container, options?: any) {
        super(parent, options);
        if (options) {
          setDataFromSCConfig(options);
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
                command: (builder: any, userInputData: any) => {
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
                        redo: () => {}
                    }
                },
                userInputDataSchema: {}
            },
            {
                name: 'Confirm',
                icon: 'check',
                visible: () => this.isEditing,
                command: (builder: any, userInputData: any) => {
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
                            this.discard();
                            if (builder) {
                                builder.classList.remove('is-editing');
                                const section = builder.closest('ide-section');
                                section && (section.style.height = 'auto');
                            }
                        },
                        undo: () => {
                        },
                        redo: () => {}
                    }
                },
                userInputDataSchema: {}
            }
        ];
        return actions;
    }

    async onConfigSave(config: IConfigData) {
        this.tag = config;
        this.updateMarkdown(config);
    }

    updateMarkdown(config: IConfigData) {
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

    getData() {
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

    async setData(value: any) {
        this.data = value.content || '';
        this.setTag({width: value.width, height: value.height});
        this.pnlEditor.visible = this.pnlAIPrompt.visible = this.isEditing;
        this.pnlViewer.visible = !this.isEditing;
        if (!this.data) {
            this.renderEmptyPnl();
            return;
        };
        const { width, height } = this.tag || {};
        if (!this.mdViewer) {
            this.mdViewer = await MarkdownEditor.create({
                viewer: true,
                value: this.data,
                width,
                height
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

    getTag() {
        return this.tag;
    }

    async setTag(value: any) {
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
        // this.pnlEditor.visible = false;
        // this.pnlViewer.visible = true;
        this.isEditing = false;
        await this.setData({
            content: this.mdEditor?.getMarkdownValue() || ''
        });
        const builder = this.parent.closest('ide-toolbar') as any;
        builder && builder.setData({content: this.data});
    }

    async discard() {
        // this.pnlEditor.visible = false;
        // this.pnlViewer.visible = true;
        this.isEditing = false;
        await this.setData({
            content: this.data
        });
        const builder = this.parent.closest('ide-toolbar') as any;
        builder && builder.setData({content: this.data});
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
            this.mdEditor = await MarkdownEditor.create({
                value: this.data,
                mode: 'wysiwyg',
                width,
                height
            });
            this.mdEditor.display = 'block';
            this.pnlEditor.clearInnerHTML();
            this.pnlEditor.appendChild(this.mdEditor);
        } else {
            this.mdEditor.value = this.data;
        }
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

    async sendAIPrompt() {
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

    async stopAPIPrompt() {
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
