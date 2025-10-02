import { createRouter, createWebHistory } from 'vue-router'

const Home        = () => import('../views/Home.vue')
const Profile     = () => import('../views/Profile.vue')
const Lists       = () => import('../views/Lists.vue')
const Help        = () => import('../views/Help.vue')
const Historial   = () => import('../views/Historial.vue')
const Preferences = () => import('../views/Preferences.vue')
const Notifications = () => import('../views/Notifications.vue')

const routes = [
    { path: '/',            name: 'home',          component: Home,          meta: { title: 'Inicio' } },
    { path: '/profile',     name: 'profile',       component: Profile,       meta: { title: 'Perfil' } },
    { path: '/lists',       name: 'lists',         component: Lists,         meta: { title: 'Listas' } },
    { path: '/help',        name: 'help',          component: Help,          meta: { title: 'Ayuda' } },
    { path: '/historial',   name: 'historial',     component: Historial,     meta: { title: 'Historial' } },
    { path: '/preferences', name: 'preferences',   component: Preferences,   meta: { title: 'Preferencias' } },
    { path: '/notifications', name: 'notifications', component: Notifications, meta: { title: 'Notificaciones' } },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { left: 0, top: 0 }
    },
})

router.afterEach((to) => {
    if (to.meta && to.meta.title) document.title = `${to.meta.title} — Compartir`
})

export default router
