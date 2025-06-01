// 这是一个空的入口文件，用于解决资源发布问题
// 由于canbus-settings主要是一个管理员扩展，论坛方面不需要特别的功能
// 但Flarum期望找到这个文件

import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import LinkButton from 'flarum/common/components/LinkButton';
import CanBusPage from './components/CanBusPage';

app.initializers.add('ltydi/canbus-settings', () => {
  // 这个扩展在论坛侧不做任何事情
  
  // 注册路由
  app.routes.canbus = {
    path: '/canbus',
    component: CanBusPage
  };

  // 添加左侧导航项
  extend(IndexPage.prototype, 'navItems', function(items) {
    items.add('canbus-settings',
      <LinkButton 
        icon="fas fa-car"
        href={app.route('canbus')}
      >
        CanBus Settings
      </LinkButton>,
      85 // 位置优先级
    );
  });
}); 