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
          // Primario azul oscuro, Secundario verde, Fondo gris claro
          primary: '#0D47A1',
          secondary: '#4CAF50',
          background: '#F5F5F5',
        },
      },
    },
  },
});