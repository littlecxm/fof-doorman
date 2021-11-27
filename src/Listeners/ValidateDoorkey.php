<?php

/*
 * This file is part of fof/doorman.
 *
 * Copyright (c) Reflar.
 * Copyright (c) FriendsOfFlarum.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 */

namespace FoF\Doorman\Listeners;

use Flarum\Settings\SettingsRepositoryInterface;
use Flarum\User\Event\Saving;
use FoF\Doorman\Doorkey;
use FoF\Doorman\Validators\DoorkeyLoginValidator;
use Illuminate\Support\Arr;

class ValidateDoorkey
{
    protected $validator;
    protected $settings;

    public function __construct(DoorkeyLoginValidator $validator, SettingsRepositoryInterface $settings)
    {
        $this->validator = $validator;
        $this->settings = $settings;
    }

    /**
     * @param Saving $event
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function handle(Saving $event)
    {
        $attributes = Arr::get($event->data, 'attributes', []);
        $user = $event->user;

        if (isset($attributes['fof-doorkey']) && $event->user->exists) {
            $key = strtoupper($attributes['fof-doorkey']);
            $this->validator->assertValid([
                'fof-doorkey' => $key,
            ]);
            $doorkey = Doorkey::where('key', $key)->first();
            if ($doorkey->group_id !== 3) {
                $user->groups()->attach($doorkey->group_id);
            }
            $doorkey->increment('uses');
            $event->user->invite_code = $key;
        }
    }
}
