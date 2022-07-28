import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
	theme: {
		themes: {
			light: {
				// appbaeとかに使われてる色 （ひとまず青）
				primary: '#21ed69',
				secondary: '#d2bc40',
				accent: '#dc395f',
				error: '#ffeb3b',
				warning: '#ffc107',
				info: '#ff5722',
				success: '#795548',
			},
		},
	},
})
