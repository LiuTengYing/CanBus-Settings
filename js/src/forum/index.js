import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import IndexPage from 'flarum/forum/components/IndexPage';
import LinkButton from 'flarum/common/components/LinkButton';
import CanBusPage from './components/CanBusPage';

app.initializers.add('ltydi/canbus-settings', () => {
  // 注册路由
  app.routes.canbus = {
    path: '/canbus',
    component: CanBusPage
  };

  // 添加左侧导航项
  extend(IndexPage.prototype, 'navItems', function(items) {
    // 获取自定义显示名称，如果没有则使用默认值
    const displayName = app.forum.attribute('canbus.displayName') || 
                       app.data?.settings?.['ltydi-canbus-settings.displayName'] || 
                       'CanBus Settings';
    
    items.add('canbus-settings',
      <LinkButton 
        icon="fas fa-car"
        href={app.route('canbus')}
      >
        {displayName}
      </LinkButton>,
      85 // 位置优先级
    );
  });
});