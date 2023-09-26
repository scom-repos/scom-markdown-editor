import {Styles} from '@ijstech/components';

const Theme = Styles.Theme.ThemeVars;
const maxLevel = 6;
const levels = Array.from({ length: maxLevel }, (_, i) => i + 1);
const ratio = 1.25;
const lineHeight = '1.618em';

const pStyle = (level: number) => {
    return {
        fontSize: `${24 - (level * 2)}px`,
        fontWeight: 'normal',
        lineHeight: lineHeight
    }
};
const pBaseFontSize = (size: string) => {
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
}
const pSizeStyle = (level: number, size: string) => {
    const baseFontSize = pBaseFontSize(size);
    if (level <= 0) {
        return `font-size: ${baseFontSize}px;`;
    }
    const fontSize = baseFontSize * Math.pow(ratio, maxLevel - level + 1);
    return `font-size: ${Math.round((fontSize + Number.EPSILON) * 100) / 100}px;`;
}
let fontSizeStyle = '';
['xs', 'sm', 'md','lg', 'xl'].forEach(size => {
    levels.forEach(p => {
        fontSizeStyle+=`.font-${size} .toastui-editor-contents .p${p} {
            ${pSizeStyle(p, size)}
            line-height: ${lineHeight};
        }\n`;
    });
    levels.forEach(p => {
        fontSizeStyle+=`.i-page-section.font-${size} .toastui-editor-contents .p${p} {
            ${pSizeStyle(p, size)}
            line-height: ${lineHeight};
        }\n`;
    });
    fontSizeStyle+=`.font-${size} .toastui-editor-contents p {
        ${pSizeStyle(0, size)}
    }\n`;
    fontSizeStyle+=`i-scom-markdown-editor.font-${size} .toastui-editor-contents p {
        ${pSizeStyle(0, size)}
    }\n`;
});
['xs', 'sm', 'md','lg', 'xl'].forEach(size => {
    levels.forEach(p => {
        fontSizeStyle+=`.font-${size} .toastui-editor-contents h${p} {
            ${pSizeStyle(p, size)}
            line-height: ${lineHeight};
        }\n`;
    });
    levels.forEach(p => {
        fontSizeStyle+=`.i-page-section.font-${size} .toastui-editor-contents h${p} {
            ${pSizeStyle(p, size)}
            line-height: ${lineHeight};
        }\n`;
    });
});

Styles.cssRaw(fontSizeStyle);
Styles.cssRule('i-scom-markdown-editor', {
    overflow: 'hidden',
    outline: 'none',
    $nest: {
        'i-panel.container': {
            width: Theme.layout.container.width,
            maxWidth: Theme.layout.container.maxWidth,
            overflow: Theme.layout.container.overflow,
            textAlign: (Theme.layout.container.textAlign as any),
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
        },
        '.toastui-editor-contents h1, i-scom-markdown-editor .toastui-editor-contents h2, i-scom-markdown-editor .toastui-editor-contents h3, i-scom-markdown-editor .toastui-editor-contents h4, i-scom-markdown-editor .toastui-editor-contents h5, i-scom-markdown-editor .toastui-editor-contents h6': {
            lineHeight: lineHeight
        }
    }
});
