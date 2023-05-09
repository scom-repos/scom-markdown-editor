/// <amd-module name="@scom/scom-markdown-editor/index.css.ts" />
declare module "@scom/scom-markdown-editor/index.css.ts" { }
/// <amd-module name="@scom/scom-markdown-editor/interface.ts" />
declare module "@scom/scom-markdown-editor/interface.ts" {
    export interface IConfig {
        name: string;
        type: 'config' | 'event';
        config: IConfigSchema;
    }
    export interface IConfigSchema {
        type: 'integer' | 'number' | 'boolean' | 'string' | 'object';
        format?: 'date' | 'datetime' | 'color' | 'tab';
        enum?: any[];
        required?: string[];
        properties?: {
            [key: string]: IConfigSchema;
        };
    }
    export interface PageBlock {
        getData: () => any;
        setData: (data: any) => Promise<void>;
        getTag: () => any;
        setTag: (tag: any) => Promise<void>;
        validate?: () => boolean;
        defaultEdit?: boolean;
        tag?: any;
        readonly onEdit: () => Promise<void>;
        readonly onConfirm: () => Promise<void>;
        readonly onDiscard: () => Promise<void>;
        edit: () => Promise<void>;
        confirm: () => Promise<void>;
        discard: () => Promise<void>;
        config?: () => Promise<void>;
    }
}
/// <amd-module name="@scom/scom-markdown-editor/store.ts" />
declare module "@scom/scom-markdown-editor/store.ts" {
    export const setDataFromSCConfig: (options: any) => void;
    export const getAIAPIUrl: () => string;
    export const getAIAPIKey: () => string;
}
/// <amd-module name="@scom/scom-markdown-editor/API.ts" />
declare module "@scom/scom-markdown-editor/API.ts" {
    function fetchAIGeneratedText(prompt: string): Promise<ReadableStream<Uint8Array>>;
    export { fetchAIGeneratedText };
}
/// <amd-module name="@scom/scom-markdown-editor/scconfig.json.ts" />
declare module "@scom/scom-markdown-editor/scconfig.json.ts" {
    const _default: {
        name: string;
        version: string;
        env: string;
        moduleDir: string;
        main: string;
        modules: {
            "@markdown-editor/main": {
                path: string;
            };
            "@markdown-editor/global": {
                path: string;
            };
            "@markdown-editor/store": {
                path: string;
            };
        };
        aiAPIUrl: string;
        aiAPIKey: string;
    };
    export default _default;
}
/// <amd-module name="@scom/scom-markdown-editor" />
declare module "@scom/scom-markdown-editor" {
    import { Module, Container, ControlElement, IDataSchema } from '@ijstech/components';
    import "@scom/scom-markdown-editor/index.css.ts";
    export interface IConfigData {
        width?: string;
        height?: string;
        background?: string;
    }
    type ThemeType = 'dark' | 'light';
    interface ScomMarkdownElement extends ControlElement {
        data?: string;
        editMode?: boolean;
        theme?: ThemeType;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-markdown-editor']: ScomMarkdownElement;
            }
        }
    }
    export default class ScomMarkdownEditor extends Module {
        private oldData;
        private pnlMarkdownEditor;
        private pnlEditor;
        private pnlViewer;
        private pnlAIPrompt;
        private inputAIPrompt;
        private mdEditor;
        private mdViewer;
        private btnStop;
        private btnSend;
        private pnlWaiting;
        private oldTag;
        tag: any;
        defaultEdit: boolean;
        private isEditing;
        private isStopped;
        private oldContent;
        private _data;
        private _editMode;
        private _theme;
        readonly onEdit: () => Promise<void>;
        readonly onConfirm: () => Promise<void>;
        readonly onDiscard: () => Promise<void>;
        constructor(parent?: Container, options?: any);
        static create(options?: ScomMarkdownElement, parent?: Container): Promise<ScomMarkdownEditor>;
        get data(): string;
        set data(value: string);
        get editMode(): boolean;
        set editMode(value: boolean);
        get theme(): ThemeType;
        set theme(value: ThemeType);
        init(): void;
        private preventDrag;
        private _getActions;
        private updateMarkdown;
        private getData;
        private renderEmptyPnl;
        private setData;
        private getTag;
        private setTag;
        getConfigurators(): ({
            name: string;
            target: string;
            getActions: () => ({
                name: string;
                icon: string;
                visible: () => boolean;
                command: (builder: any, userInputData: any) => {
                    execute: () => void;
                    undo: () => void;
                    redo: () => void;
                };
                userInputDataSchema: {};
            } | {
                name: string;
                icon: string;
                visible: () => boolean;
                command: (builder: any, userInputData: any) => {
                    execute: () => Promise<void>;
                    undo: () => void;
                    redo: () => void;
                };
                userInputDataSchema: IDataSchema;
            })[];
            getData: any;
            setData: any;
            getTag: any;
            setTag: any;
        } | {
            name: string;
            target: string;
            getData: any;
            setData: any;
            getTag: any;
            setTag: any;
            getActions?: undefined;
        })[];
        private edit;
        private confirm;
        private discard;
        private renderEditor;
        private toggleStopBtn;
        private readAllChunks;
        private sendAIPrompt;
        private stopAPIPrompt;
        render(): any;
    }
}
