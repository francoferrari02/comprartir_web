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
const Verify        = () => import('../views/Verify.vue')
const ForgotPassword = () => import('../views/ForgotPassword.vue')
const ResetPassword = () => import('../views/ResetPassword.vue')
const ListDetail    = () => import('../views/ListDetail.vue')
const Pantries      = () => import('../views/Pantries.vue')
const PantryDetail  = () => import('../views/PantryDetail.vue')

const routes = [
    // Public routes
    { path: '/login',          name: 'login',          component: Login,          meta: { title: 'Ingresar', public: true } },
    { path: '/register',       name: 'register',       component: Register,       meta: { title: 'Registrarse', public: true } },
    { path: '/verify',         name: 'verify',         component: Verify,         meta: { title: 'Verificar cuenta', public: true } },
    { path: '/forgot-password', name: 'forgot-password', component: ForgotPassword, meta: { title: 'Recuperar contraseña', public: true, allowWhenAuthenticated: true } },
    { path: '/reset-password', name: 'reset-password', component: ResetPassword,  meta: { title: 'Restablecer contraseña', public: true, allowWhenAuthenticated: true, hideHeader: true } },

    // Protected routes (require authentication)
    { path: '/',              name: 'home',          component: Home,          meta: { title: 'Inicio', requiresAuth: true } },
    { path: '/lists',         name: 'lists',         component: Lists,         meta: { title: 'Listas', requiresAuth: true } },
    { path: '/lists/:id',     name: 'list-detail',   component: ListDetail,    meta: { title: 'Detalle de lista', requiresAuth: true }, props: true },

    { path: '/pantries',      name: 'pantries',      component: Pantries,      meta: { title: 'Despensas', requiresAuth: true } },
    { path: '/pantries/:id',  name: 'pantry-detail', component: PantryDetail,  meta: { title: 'Detalle de despensa', requiresAuth: true }, props: true },

    { path: '/historial',     name: 'historial',     component: Historial,     meta: { title: 'Historial', requiresAuth: true } },
    { path: '/preferences',   name: 'preferences',   component: Preferences,   meta: { title: 'Preferencias', requiresAuth: true } },
    { path: '/profile',       name: 'profile',       component: Profile,       meta: { title: 'Perfil', requiresAuth: true } },
    { path: '/notifications', name: 'notifications', component: Notifications, meta: { title: 'Notificaciones', requiresAuth: true } },
    { path: '/help',          name: 'help',          component: Help,          meta: { title: 'Ayuda', requiresAuth: true } },

    // 404 Catch-all route - debe ir al final
    { path: '/:pathMatch(.*)*', name: 'not-found', redirect: '/' }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { left: 0, top: 0 }
    },
})

// Global navigation guard for authentication
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('accessToken')
    const isAuthenticated = !!token
    const requiresAuth = to.meta?.requiresAuth
    const isPublicRoute = to.meta?.public
    const allowWhenAuthenticated = to.meta?.allowWhenAuthenticated

    // If route requires auth and user is not authenticated
    if (requiresAuth && !isAuthenticated) {
        return next({
            path: '/login',
            query: { r: to.fullPath }
        })
    }

    // If user is authenticated and trying to access public routes (login, register, etc.)
    // Redirect to home
    if (isAuthenticated && isPublicRoute && !allowWhenAuthenticated) {
        return next({ path: '/' })
    }

    next()
})

router.afterEach((to) => {
    if (to.meta && to.meta.title) document.title = `${to.meta.title} — Compartir`
})

export default router
