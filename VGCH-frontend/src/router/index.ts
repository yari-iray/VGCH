import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import ConsoleView from '@/views/Visualizer/ConsoleView.vue';
import ManufacturerView from '@/views/Visualizer/ManufacturerView.vue';
import ComponentView from '@/views/Visualizer/ComponentView.vue';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/visualizer',
            name: 'visualizer',
            component: () => import('../views/Visualizer/VisualizerView.vue'),
        },
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/auth/LoginView.vue'),
        },
        {
            path: '/download',
            name: 'download',
            component: () => import('../views/DownloadView.vue'),
        },
        {
            path: '/submission',
            name: 'submission',
            component: () => import('../views/SubmissionView.vue'),
        },
        {
            path: '/about',
            name: 'about',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/AboutView.vue'),
        },
        {
            path: '/console/:id',
            name: 'console',
            component: ConsoleView,
            props: true,
        },
        {
            path: '/manufacturer/:id',
            name: 'manufacturer',
            component: ManufacturerView,
            props: true,
        },
        {
            path: '/component/:id',
            name: 'component',
            component: ComponentView,
            props: true,
        },
    ],
});

// Set document title based on route
router.beforeEach((to, from, next) => {
    let title = 'VGCH';
    if (to.name === 'console' && to.params.id) {
        title = `Console: ${to.params.id} | VGCH`;
    } else if (to.name === 'manufacturer' && to.params.id) {
        title = `Manufacturer: ${to.params.id} | VGCH`;
    } else if (to.name === 'component' && to.params.id) {
        title = `Component: ${to.params.id} | VGCH`;
    } else if (to.meta && to.meta.title) {
        title = to.meta.title as string;
    } else if (typeof to.name === 'string') {
        title = `${to.name.charAt(0).toUpperCase() + to.name.slice(1)} | VGCH`;
    }
    document.title = title;
    next();
});

export default router;
