// src/vuetify.js
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import '@mdi/font/css/materialdesignicons.css';

// Configuración de Vuetify con paleta personalizada
export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          // Verde principal (Comprartir brand)
          primary: '#4DA851',
          secondary: '#4CAF50',
          background: '#F4F6F8',
          surface: '#F4F6F8',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      style: 'text-transform: none; font-family: "Hanken Grotesk", sans-serif;',
    },
    VCard: {
      style: 'font-family: "Hanken Grotesk", sans-serif;',
    },
    VTextField: {
      style: 'font-family: "Hanken Grotesk", sans-serif;',
    },
    VTextarea: {
      style: 'font-family: "Hanken Grotesk", sans-serif;',
    },
  },
});