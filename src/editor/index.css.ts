import { Styles } from '@ijstech/components';

const Theme = Styles.Theme.ThemeVars;

const typingAnim = Styles.keyframes({
  '0%': { "transform": "translate(0, -7px)" },
  '25%': { "transform": "translate(0, 0)" },
  '50%': { "transform": "translate(0, 0)" },
  '75%': { "transform": "translate(0, 0)" },
  '100%': { "transform": "translate(0, 7px)" }
})

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
    '.toastui-editor-mode-switch': {
      background: 'transparent'
    }
  }
});
