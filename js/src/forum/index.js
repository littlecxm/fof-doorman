import app from 'flarum/forum/app';
import { extend } from 'flarum/common/extend';
import SignUpModal from 'flarum/forum/components/SignUpModal';
import Stream from 'flarum/common/utils/Stream';

app.initializers.add('littlecxm-fof-doorman', () => {
    extend(SignUpModal.prototype, 'oninit', function () {
        this.doorkey = Stream('');
    });
    extend(SignUpModal.prototype, 'fields', function (fields) {
        const isOptional = JSON.parse(app.forum.data.attributes['littlecxm-fof-doorman.allowPublic']);
        let placeholder = app.translator.trans('fof-doorman.forum.sign_up.doorman_placeholder');
        if (isOptional) {
            placeholder = app.translator.trans('fof-doorman.forum.sign_up.doorman_placeholder_optional');
        }
        fields.add(
            'doorkey',
            <div className="Form-group">
                <input className="FormControl" name="fof-doorkey" type="text" placeholder={placeholder} bidi={this.doorkey} disabled={this.loading} />
            </div>
        );
    });

    extend(SignUpModal.prototype, 'submitData', function (data) {
        const newData = data;
        newData['fof-doorkey'] = this.doorkey;
        return newData;
    });
});
