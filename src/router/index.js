// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'

const Home          = () => import('../views/Home.vue')
const Profile       = () => import('../views/Profile.vue')
const Lists         = () => import('../views/Lists.vue')
const Help          = () => import('../views/Help.vue')
const Historial     = () => import('../views/Historial.vue')
const Preferences   = () => import('../views/Preferences.vue')
const Notifications = () => import('../views/Notifications.vue')
const Login         = () => import('../views/Login.vue')
const Register      = () => import('../views/Register.vue')
const ResetPassword = () => import('../views/ResetPassword.vue')
const ListDetail    = () => import('../views/ListDetail.vue')
const Categories    = () => import('../views/Categories.vue')

const routes = [
    { path: '/',              name: 'home',          component: Home,          meta: { title: 'Inicio' } },
    { path: '/lists',         name: 'lists',         component: Lists,         meta: { title: 'Listas' } },
    { path: '/lists/:id',     name: 'list-detail',   component: ListDetail,    meta: { title: 'Detalle de lista' } },
    { path: '/categories',    name: 'categories',    component: Categories,    meta: { title: 'Categorías' } },
    { path: '/historial',     name: 'historial',     component: Historial,     meta: { title: 'Historial' } },
    { path: '/preferences',   name: 'preferences',   component: Preferences,   meta: { title: 'Preferencias' } },
    { path: '/profile',       name: 'profile',       component: Profile,       meta: { title: 'Perfil' } },
    { path: '/notifications', name: 'notifications', component: Notifications, meta: { title: 'Notificaciones' } },
    { path: '/help',          name: 'help',          component: Help,          meta: { title: 'Ayuda' } },
    { path: '/login',         name: 'login',         component: Login,         meta: { title: 'Ingresar' } },
    { path: '/register',      name: 'register',      component: Register,      meta: { title: 'Registrarse' } },
    { path: '/reset-password', name: 'reset-password', component: ResetPassword, meta: { title: 'Restablecer contraseña' } },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { left: 0, top: 0 }
    },
})

// Guard de navegación deshabilitado para permitir acceso sin autenticación
// router.beforeEach((to) => {
//     const token = localStorage.getItem('auth_token') // misma key que en services/auth.js
//     if (to.meta?.requiresAuth && !token) {
//         return { path: '/login', query: { r: to.fullPath } }
//     }
// })

router.afterEach((to) => {
    if (to.meta && to.meta.title) document.title = `${to.meta.title} — Compartir`
})

export default router
