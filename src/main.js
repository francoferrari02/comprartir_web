import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';

const app = createApp(App);
app.use(vuetify); // Use Vuetify
app.mount('#app');
