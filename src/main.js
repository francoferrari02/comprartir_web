import { createApp } from 'vue'
import App from './App.vue'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'

import './styles/fonts.css'
import './styles/theme.css'

// Router
import router from './router'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {
                colors: {
                    primary:  '#4DA851', // ← nuevo verde
                    primary2: '#3E8E47', // hover/pressed
                    primaryBg:'#E9F7F0', // fondos tonales
                    surface:  '#F4F6F8',
                    onSurface:'#0F172A',
                    outline:  '#E5E7EB',
                    success:  '#4DA851',
                    info:     '#0EA5E9',
                    warning:  '#F59E0B',
                    error:    '#EF4444',
                },
            },
        },
    },
})

createApp(App).use(vuetify).use(router).mount('#app')
