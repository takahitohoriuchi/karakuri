import Vue from 'vue'
import VueRouter from 'vue-router'
import HomeView from '../views/HomeView.vue'

Vue.use(VueRouter)

const routes = [
	{
		path: '/',
		name: 'home',
		component: HomeView,
	},
	{
		path: '/loader',
		name: 'loader',
		component: () => import('../views/LoaderView.vue'),
	},
	{
		path: '/play',
		name: 'play',
		component: () => import('../views/PlayView.vue'),
		props: true,
	},
]

const router = new VueRouter({
	//   mode: 'history',
	mode: 'hash',
	base: process.env.BASE_URL,
	routes,
})

export default router
