/// <amd-module name="@scom/scom-markdown-editor/index.css.ts" />
declare module "@scom/scom-markdown-editor/index.css.ts" { }
/// <amd-module name="@scom/scom-markdown-editor/store.ts" />
declare module "@scom/scom-markdown-editor/store.ts" {
    export const setDataFromSCConfig: (options: any) => void;
    export const getAIAPIUrl: () => string;
    export const getAIAPIKey: () => string;
}
/// <amd-module name="@scom/scom-markdown-editor/data.json.ts" />
declare module "@scom/scom-markdown-editor/data.json.ts" {
    const _default: {
        aiAPIUrl: string;
        aiAPIKey: string;
        defaultBuilderData: {
            content: string;
        };
    };
    export default _default;
}
/// <amd-module name="@scom/scom-markdown-editor/API.ts" />
declare module "@scom/scom-markdown-editor/API.ts" {
    function fetchAIGeneratedText(prompt: string): Promise<ReadableStream<Uint8Array>>;
    export { fetchAIGeneratedText };
}
/// <amd-module name="@scom/scom-markdown-editor/editor/index.css.ts" />
declare module "@scom/scom-markdown-editor/editor/index.css.ts" { }
/// <amd-module name="@scom/scom-markdown-editor/editor/index.tsx" />
declare module "@scom/scom-markdown-editor/editor/index.tsx" {
    import { Module, ControlElement } from '@ijstech/components';
    import "@scom/scom-markdown-editor/editor/index.css.ts";
    interface ScomEditorConfigElement extends ControlElement {
        content?: string;
        theme?: string;
        tag?: any;
    }
    global {
        namespace JSX {
            interface IntrinsicElements {
                ['i-scom-markdown-editor-config']: ScomEditorConfigElement;
            }
        }
    }
    type ThemeType = 'dark' | 'light';
    export default class Config extends Module {
        private pnlEditor;
        private mdEditor;
        private inputAIPrompt;
        private btnStop;
        private btnSend;
        private pnlWaiting;
        private wrapPnl;
        private _data;
        private _theme;
        private isStopped;
        tag: any;
        get content(): string;
        set content(value: string);
        get theme(): ThemeType;
        set theme(value: ThemeType);
        getTag(): any;
        setTag(value: any): Promise<void>;
        private updateMardown;
        private renderEditor;
        private toggleStopBtn;
        private readAllChunks;
        private sendAIPrompt;
        private stopAPIPrompt;
        init(): void;
        render(): any;
    }
}
/// <amd-module name="@scom/scom-markdown-editor" />
declare module "@scom/scom-markdown-editor" {
    import { Module, VStack, Container, ControlElement, IDataSchema } from '@ijstech/components';
    import "@scom/scom-markdown-editor/index.css.ts";
    export interface IConfigData {
        width?: string;
        height?: string;
        background?: string;
    }
    type ThemeType = 'dark' | 'light';
    interface ScomMarkdownElement extends ControlElement {
        lazyLoad?: boolean;
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
        private pnlMarkdownEditor;
        private pnlEmpty;
        private mdViewer;
        tag: any;
        defaultEdit: boolean;
        private _data;
        private _theme;
        private _rootParent;
        private bgString;
        readonly onEdit: () => Promise<void>;
        readonly onConfirm: () => Promise<void>;
        readonly onDiscard: () => Promise<void>;
        constructor(parent?: Container, options?: any);
        static create(options?: ScomMarkdownElement, parent?: Container): Promise<ScomMarkdownEditor>;
        get data(): string;
        set data(value: string);
        get theme(): ThemeType;
        set theme(value: ThemeType);
        private setRootParent;
        private getBackgroundColor;
        init(): Promise<void>;
        private _getActions;
        private updateMarkdown;
        private getData;
        private toggleEmpty;
        private setData;
        private getTag;
        private setTag;
        getConfigurators(): ({
            name: string;
            target: string;
            getActions: () => ({
                name: string;
                icon: string;
                command: (builder: any, userInputData: any) => {
                    execute: () => Promise<void>;
                    undo: () => Promise<void>;
                    redo: () => void;
                };
                userInputDataSchema: {};
                customUI: {
                    render: (data?: any, onConfirm?: (result: boolean, data: any) => void) => VStack;
                };
                visible?: undefined;
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
                customUI?: undefined;
            })[];
            getData: any;
            setData: (data: any) => Promise<void>;
            getTag: any;
            setTag: any;
            setRootParent: any;
        } | {
            name: string;
            target: string;
            getData: any;
            setData: any;
            getTag: any;
            setTag: any;
            getActions?: undefined;
            setRootParent?: undefined;
        })[];
        private getThemeSchema;
        render(): any;
    }
}
