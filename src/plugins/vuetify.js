import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
	theme: {
		themes: {
			light: {
				primary: '#21ed69',
				secondary: '#d2bc40',
				base: '#bdbdbd',
				palebase: '#eeeeee',
				accent: '#dc395f',
				error: '#ffeb3b',
				warning: '#ffc107',
				info: '#ff5722',
				success: '#795548',
			},		
		},
	},
})
