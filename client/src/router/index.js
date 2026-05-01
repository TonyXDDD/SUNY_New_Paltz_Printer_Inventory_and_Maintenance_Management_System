import {createRouter, createWebHistory} from 'vue-router'
import Home from '../views/Home.vue'
import Academic from '../views/Academic.vue'
import Dorms from '../views/Dorms.vue'
import Storage from '../views/Storage.vue'
import Auth from '../views/Auth.vue'

//set routes to each page, specifies whether or not it requires
//user authentication
const routes = [
    { path: '/', component: Home },
    { path: '/Academic', component: Academic, meta: { requiresAuth: true } },
    { path: '/Dorms', component: Dorms, meta: { requiresAuth: true } },
    { path: '/Storage', component: Storage, meta: { requiresAuth: true } },
    { path: '/Auth', component: Auth }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

// routes user to login if not logged in
router.beforeEach((to, from, next) => {
    const isLoggedIn = localStorage.getItem("user_id")

    if (to.meta.requiresAuth && !isLoggedIn) {
        next('/Auth')
    } else {
        next()
    }
})

export default router