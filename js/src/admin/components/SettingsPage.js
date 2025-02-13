import ExtensionPage from 'flarum/admin/components/ExtensionPage';
import LoadingIndicator from 'flarum/common/components/LoadingIndicator';
import DoormanSettingsListItem from './DoormanSettingsListItem';
import Button from 'flarum/common/components/Button';
import Select from 'flarum/common/components/Select';
import Switch from 'flarum/common/components/Switch';
import app from 'flarum/admin/app';
import saveSettings from 'flarum/admin/utils/saveSettings';
import Stream from 'flarum/common/utils/Stream';
import withAttr from 'flarum/common/utils/withAttr';

export default class DoormanSettingsPage extends ExtensionPage {
    oninit(vnode) {
        super.oninit(vnode);

        this.loading = false;
        this.switcherLoading = false;
        this.doorkeys = app.store.all('doorkeys');
        this.isOptional = app.data.settings['littlecxm-fof-doorman.allowPublic'];

        this.doorkey = {
            key: Stream(this.generateRandomKey()),
            groupId: Stream(3),
            maxUses: Stream(10),
            activates: Stream(false),
        };
    }

    content() {
        return (
            <div className="container Doorkey-container">
                {this.loading ? <LoadingIndicator /> : ''}
                <div className="Doorkeys-title">
                    <h2>{app.translator.trans('fof-doorman.admin.page.doorkey.title')}</h2>
                    <div className="helpText">{app.translator.trans('fof-doorman.admin.page.doorkey.help.key')}</div>
                    <div className="helpText">{app.translator.trans('fof-doorman.admin.page.doorkey.help.group')}</div>
                    <div className="helpText">{app.translator.trans('fof-doorman.admin.page.doorkey.help.max')}</div>
                    <div className="helpText">{app.translator.trans('fof-doorman.admin.page.doorkey.help.activates')}</div>
                </div>
                <div className="Doorkeys-fieldLabels">
                    <h3 className="key">{app.translator.trans('fof-doorman.admin.page.doorkey.heading.key')}</h3>
                    <h3 className="group">{app.translator.trans('fof-doorman.admin.page.doorkey.heading.group')}</h3>
                    <h3 className="maxUses">{app.translator.trans('fof-doorman.admin.page.doorkey.heading.max_uses')}</h3>
                    <h3 className="activate">{app.translator.trans('fof-doorman.admin.page.doorkey.heading.activate')}</h3>
                </div>
                <div className="Doorkeys">
                    {this.doorkeys.map((doorkey) => {
                        return DoormanSettingsListItem.component({ doorkey, doorkeys: this.doorkeys });
                    })}
                </div>
                <div className="Doorkeys-new">
                    <div className="Doorkeys-newInputs">
                        <input
                            className="FormControl Doorkey-key"
                            type="text"
                            value={this.doorkey.key()}
                            placeholder={app.translator.trans('fof-doorman.admin.page.doorkey.key')}
                            oninput={withAttr('value', this.doorkey.key)}
                        />
                        {Select.component({
                            options: this.getGroupsForInput(),
                            className: 'Doorkey-select',
                            onchange: this.doorkey.groupId,
                            value: this.doorkey.groupId(),
                        })}
                        <input
                            className="FormControl Doorkey-maxUses"
                            value={this.doorkey.maxUses()}
                            type="number"
                            placeholder={app.translator.trans('fof-doorman.admin.page.doorkey.max_uses')}
                            oninput={withAttr('value', this.doorkey.maxUses)}
                            min="0"
                        />
                        {Switch.component({
                            state: this.doorkey.activates() || false,
                            onchange: this.doorkey.activates,
                            className: 'Doorkey-switch',
                        })}
                    </div>
                    {Button.component({
                        type: 'button',
                        className: 'Button Button--warning Doorkey-button',
                        icon: 'fa fa-plus',
                        onclick: this.createDoorkey.bind(this),
                    })}
                </div>
                <div className="Doorkey-allowPublic">
                    <h2>{app.translator.trans('fof-doorman.admin.page.doorkey.allow-public.title')}</h2>
                    {this.switcherLoading ? (
                        <LoadingIndicator />
                    ) : (
                        <Switch state={this.isOptional} onchange={this.toggleOptional.bind(this)} className="AllowPublic-switch">
                            {app.translator.trans('fof-doorman.admin.page.doorkey.allow-public.switch-label')}
                        </Switch>
                    )}
                </div>
            </div>
        );
    }

    getGroupsForInput() {
        let options = [];

        app.store.all('groups').map((group) => {
            if (group.nameSingular() === 'Guest') {
                return;
            }
            options[group.id()] = group.nameSingular();
        });

        return options;
    }

    generateRandomKey() {
        return Array(8 + 1)
            .join((Math.random().toString(36) + '00000000000000000').slice(2, 18))
            .slice(0, 8);
    }

    createDoorkey() {
        app.store
            .createRecord('doorkeys')
            .save({
                key: this.doorkey.key(),
                groupId: this.doorkey.groupId(),
                maxUses: this.doorkey.maxUses(),
                activates: this.doorkey.activates(),
            })
            .then((doorkey) => {
                this.doorkey.key(this.generateRandomKey());
                this.doorkey.groupId(3);
                this.doorkey.maxUses(10);
                this.doorkey.activates('');
                this.doorkeys.push(doorkey);
                m.redraw();
            });
    }

    toggleOptional() {
        this.switcherLoading = true;
        const settings = {
            'littlecxm-fof-doorman.allowPublic': !this.isOptional,
        };
        saveSettings(settings)
            .then(() => {
                this.isOptional = JSON.parse(app.data.settings['littlecxm-fof-doorman.allowPublic']);
            })
            .catch(() => {})
            .then(() => {
                this.switcherLoading = false;
                m.redraw();
            });
    }
}
