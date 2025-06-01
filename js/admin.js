import app from 'flarum/admin/app';
import CanBusSettingsPage from './src/admin/components/CanBusSettingsPage';

app.initializers.add('ltydi/canbus-settings', () => {
  app.extensionData
    .for('ltydi-canbus-settings')
    .registerPage(CanBusSettingsPage);
});
