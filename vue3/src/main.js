import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')


//let instance = null;

function render(props={}){
  const { container } = props;
  createApp(App).mount(container ? container.querySelector('#app') : '#app') 
}


export async function bootstrap() {
  console.log('[vue] vue app bootstraped');
}
export async function mount(props) {
  console.log('[vue] props from main framework', props);
  render(props);
} 
export async function unmount() {
  // instance.$destroy();
  // instance.$el.innerHTML = '';
  // instance = null; 
} 
// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render();
}