import app from 'flarum/admin/app';
import Doorkey from './models/Doorkey';
import SettingsPage from './components/SettingsPage';

app.initializers.add('littlecxm-fof-doorman', () => {
    app.store.models.doorkeys = Doorkey;

    app.extensionData.for('littlecxm-fof-doorman').registerPage(SettingsPage);
});
