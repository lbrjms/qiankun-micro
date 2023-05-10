# qiankun 微前端搭建 包含vite vue3 vue2 纯html 公用事件抽取  公用状态封装  全局loading  一键安装 一键启动 一键打包

## 主应用

基座（主应用）负责导航的渲染和登录态的下发，为子应用提供一个挂载的容器div，基座应该保持简洁（qiankun官方demo甚至直接使用原生html搭建），不应该做涉及业务的操作
## 主应用注册微应用

```
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'react app', // app name registered
    entry: '//localhost:7100',
    container: '#yourContainer',
    activeRule: '/yourActiveRule',
  },
  {
    name: 'vue app',
    entry: { scripts: ['//localhost:7100/main.js'] },
    container: '#yourContainer2',
    activeRule: '/yourActiveRule2',
  },
]);

start();
```

## 微应用导出周期函数

微应用需要在自己的入口 js (通常就是你配置的 webpack 的 entry js) 导出 bootstrap、mount、unmount 三个生命周期钩子，以供主应用在适当的时机调用。

```
/**
 * bootstrap 只会在微应用初始化的时候调用一次，下次微应用重新进入时会直接调用 mount 钩子，不会再重复触发 bootstrap。
 * 通常我们可以在这里做一些全局变量的初始化，比如不会在 unmount 阶段被销毁的应用级别的缓存等。
 */
export async function bootstrap() {
  console.log('react app bootstraped');
}

/**
 * 应用每次进入都会调用 mount 方法，通常我们在这里触发应用的渲染方法
 */
export async function mount(props) {
  ReactDOM.render(<App />, props.container ? props.container.querySelector('#root') : document.getElementById('root'));
}

/**
 * 应用每次 切出/卸载 会调用的方法，通常在这里我们会卸载微应用的应用实例
 */
export async function unmount(props) {
  ReactDOM.unmountComponentAtNode(
    props.container ? props.container.querySelector('#root') : document.getElementById('root'),
  );
}

/**
 * 可选生命周期钩子，仅使用 loadMicroApp 方式加载微应用时生效
 */
export async function update(props) {
  console.log('update props', props);
}
```
## 配置微应用打包工具

```
const { name } = require('./package');
module.exports = {
  devServer: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  configureWebpack: {
    output: {
      library: `${name}-[name]`,
      libraryTarget: 'umd', // 把微应用打包成 umd 库格式
      jsonpFunction: `webpackJsonp_${name}`,
    },
  },
};
```

## webpack打包设置 __webpack_public_path__ 

```
if (window.__POWERED_BY_QIANKUN__) {
  __webpack_public_path__ = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__;
}
```

## vue3+vite 问题微前端解决方案

https://github.com/tengmaoqing/vite-plugin-qiankun/tree/master

## 微应用之间传值

* props

```
  {
    name:'subapp',
    entry:'//localhost:10200',
    container:'#microApp',
    activeRule:'/subapp',
    props: {
      test:'测试主应用传值',
      parentActions:actions
    }
  }
```
手动加载或者注册子应用的时候把需要传的值带过去

* actions 发布-订阅的设计模式

类似于watch监听 qiankun框架提供一套中间状态池 不同的子应用可以改变池子中的状态 监听状态的应用都会收到状态变化实现应用之间的传值

主应用构建状态池

```
import {
  initGlobalState
} from 'qiankun';

var state = {
  num: 1
};
// 初始化 state
const actions = initGlobalState(state);
actions.onGlobalStateChange((stat, prev) => {
  console.log('主应用检测到state变更：', stat, prev);
  state.num = stat.num
});
// 你还可以定义一个获取state的方法下发到子应用
actions.getGlobalState = function () {
  return state
}
export default actions;
```
props 下发到子应用
```
  {
    name:'subapp',
    entry:'//localhost:10200',
    container:'#microApp',
    activeRule:'/subapp',
    props: {
      test:'测试主应用传值',
      parentActions:actions
    }
  }
```

子应用中全局app（vue）中引用状态池
```
function render(props = {}) {
  const { container } = props;

  console.log('props :', props);
  instance = new Vue({
    router,
    store,
    // 挂载在根节点上
    data(){
      return {
        test: props.test,
        parentActions: props.parentActions,
      }
    },
    render: (h) => h(App),
  }).$mount(container ? container.querySelector('#app') : '#app');
}
```

子应用需要更新的时候更新状态
```
changeMainData(){
      console.log('=====> :',this.$root.parentActions);
      let a = this.$root.parentActions.getGlobalState().num
      a = a + 1
      this.$root.parentActions.setGlobalState({num: a})
    }
```

其他应用设置监听的话 就能得到状态变化

```
 mounted() {
    this.state = actions.getGlobalState().num
  },
```

## vite应用静态资源404

vit.config 文件添加下面配置
```
server: {
  origin: 'http://localhost:5173', //项目baseUrl，解决主应用中出现静态地址404问题
},
```

## 封装全局数据

把全局下发的数据封装到通用的数据存储中 里面封装的store 来保存全局数据 这样不管数据是主应用下发的还是单独启动子应用获取 对于使用者来说 不需要关心 数据来自哪里 只要从封装的store上取数据就好了

## 子应用独立仓库

随着项目发展，子应用可能会越来越多，如果子应用和基座都集合在同一个git仓库，就会越来越臃肿。

若项目有CI/CD，只修改了某个子应用的代码，但代码提交会同时触发所有子应用构建，牵一发动全身，是不合理的。

同时，如果某些业务的子应用的开发是跨部门跨团队的，代码仓库如何分权限管理又是一个问题。

## 子项目之间的公共插件如何共享
巨无霸应用的公共依赖和公共函数被太多的页面使用，导致升级和改动困难，使用微前端可以让各个子项目独立拥有自己的依赖，互不干扰。而我们想要复用公共依赖，这与微前端的理念是相悖的。

所以我的想法是：父项目提供公共依赖，子项目可以自由选择用或者不用。

## 全局loading
## 公用common
## 启动
## 打包
