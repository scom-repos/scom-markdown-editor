import { Styles } from '@ijstech/components';

const Theme = Styles.Theme.ThemeVars;

const typingAnim = Styles.keyframes({
  '0%': { "transform": "translate(0, -7px)" },
  '25%': { "transform": "translate(0, 0)" },
  '50%': { "transform": "translate(0, 0)" },
  '75%': { "transform": "translate(0, 0)" },
  '100%': { "transform": "translate(0, 7px)" }
})

const pStyle = (level: number) => {
  return {
    fontSize: `${24 - (level * 2)}px`,
    display: 'block'
  }
}

Styles.cssRule('i-scom-markdown-editor-config', {
  $nest: {
    'i-panel.container': {
      width: Theme.layout.container.width,
      maxWidth: Theme.layout.container.maxWidth,
      overflow: Theme.layout.container.overflow,
      textAlign: (Theme.layout.container.textAlign as any),
      margin: '0 auto'
    },
    '.typing': {
      transition: 'all 0.5s linear',
      $nest: {
        'i-icon:nth-last-child(1)': {
          animation: `${typingAnim} 1s 0.3s linear infinite`
        },
        'i-icon:nth-last-child(2)': {
          animation: `${typingAnim} 1s 0.2s linear infinite`
        },
        'i-icon:nth-last-child(3)': {
          animation: `${typingAnim} 1s 0.2s linear infinite`
        }
      }
    },
    'a': {
      display: 'initial'
    },
    '.toastui-editor-dropdown-toolbar': {
      maxWidth: '100%',
      flexWrap: 'wrap',
      height: 'auto'
    },
    '.toastui-editor-contents p': {
      color: Theme.text.primary
    },
    '.toastui-editor-mode-switch': {
      background: 'transparent'
    },
    '#mdEditor .toastui-editor-md-container': {
      backgroundColor: 'var(--bg-container, transparent)'
    },
    '#mdEditor .toastui-editor-ww-container': {
      backgroundColor: 'var(--bg-container, transparent)'
    },
    '.paragraph': {
      fontSize: '1.125rem !important'
    },
    '[data-type="Paragraph"]': {
      display: 'none'
    },
    '.p-item:hover': {
      background: '#dff4ff'
    },
    '.p1': pStyle(0),
    '.p2': pStyle(1),
    '.p3': pStyle(2),
    '.p4': pStyle(3),
    '.p5': pStyle(4),
    '.p6': pStyle(5)
  }
});
