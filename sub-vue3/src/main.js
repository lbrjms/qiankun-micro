import { renderWithQiankun, qiankunWindow } from 'vite-plugin-qiankun/dist/helper';

import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'


function render(props) {


    const { container } = props;
    const root = createApp(App)
    const c = container
      ? container.querySelector("#app")
      : "#app"
    root.mount(c)
  }

// some code
renderWithQiankun({
    mount(props) {
      console.log('mount');
      render(props);
    },
    bootstrap() {
      console.log('bootstrap');
    },
    unmount(props) {
      console.log('unmount');
      const { container } = props;
      const mountRoot = container?.querySelector('#root');
    //   ReactDOM.unmountComponentAtNode(
    //     mountRoot || document.querySelector('#root'),
    //   );
    },
  });
  
  if (!qiankunWindow.__POWERED_BY_QIANKUN__) {
    render({});
  }