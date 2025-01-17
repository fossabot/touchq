import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'

import './plugins/element.js'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))

Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

import TouchQ from './plugins/TouchQ.js'

Vue.prototype.$touchq = TouchQ

TouchQ.innerVue(this)

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  // store,
  template: '<App/>'
}).$mount('#app')
