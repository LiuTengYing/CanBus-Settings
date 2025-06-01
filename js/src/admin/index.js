import app from 'flarum/admin/app';
import CanBusSettingsPage from './components/CanBusSettingsPage';

app.initializers.add('ltydi-canbus-settings', () => {
  // Register route
  app.routes.canbusBrands = {
    path: '/canbus-settings',
    component: CanBusSettingsPage
  };
  
  // Register settings page and permissions
  app.extensionData
    .for('ltydi-canbus-settings')
    .registerPage(CanBusSettingsPage)
    .registerPermission({
      icon: 'fas fa-car',
      label: 'View Car Database',
      permission: 'canbus.view',
      allowGuest: false
    })
    .registerPermission({
      icon: 'fas fa-edit',
      label: 'Edit Car Database',
      permission: 'canbus.edit',
      allowGuest: false
    });
});