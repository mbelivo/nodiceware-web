var Vue = require('vue/dist/vue.common.js');

var vm = new Vue({
    el: '#app',
    created: function() {
        this.updateDataFromHash();
        this.setKeybindings();
    },
    data: {
        words: [],
        entropy: 0,
        unique_prefix: null,
        strength_score: 0,
        zipable: false,
        strength_choices: ['base', 'strong', 'stronger', 'strongest'],
        strength_labels: ['pas mal', 'correct', 'fort', 'super fort'],
        strength_index: -1,
        errorMessage: '',
        langs: ['fr', 'en'],
        lang_index: 0
    },
    computed: {
        apiurl: function() {
            let path = [
                '/api/passphrase',
                this.lang,
                this.strength
            ].join('/');

            if (this.zipable) path += '?zipable=1';

            return path;
        },
        lang: {
            set: function(lang) {
                var i = this.langs.indexOf(lang);
                if (i >= 0) {
                    this.lang_index = i;
                }
            },
            get: function() {
                if (this.lang_index < 0) return null;

                return this.langs[this.lang_index];
            }
        },
        avail_langs: function() {
            return this.langs
                .slice(null, this.lang_index)
                .concat(this.langs.slice(this.lang_index + 1));
        },
        passlen: function() {
            if (this.zipable) {
                return this.words.length * this.unique_prefix;
            }

            return this.words.reduce((acc, w) => acc + w.length, 0);
        },
        path: function() {
            return (this.zipable ? 'xpass' : 'pass') + '/' + this.strength;
        },
        splitwords: function() {
            let prefix = this.unique_prefix;

            if (!prefix) return [];

            return this.words.map((word) => {
                return {
                    pre: word.substr(0, prefix),
                    post: word.substr(prefix)
                };
            });
        },
        strength: {
            get: function() {
                if (this.strength_index < 0) {
                    return null;
                }

                return this.strength_choices[this.strength_index];
            },
            set: function(label) {
                this.strength_index = this.strength_choices.indexOf(label);
            }
        },
        strengthLabel: function() {
            if (this.strength_index < 0) {
                return null;
            }

            return this.strength_labels[this.strength_index];

        },
        isMaxStrength: function() {
            return this.strength_index === this.strength_choices.length - 1;
        },
        toggleZipableLabel: function() {
            if (this.zipable)
                return 'Essayer une version mot complet';

            return 'Essayer une version raccourcissable';
        },
        strengthClass: function() {
            var s = this.strength_score;

            if (s < 34)
                return 'verybad-strength';
            else if (s < 54)
                return 'bad-strength';
            else if (s < 68)
                return 'mediocre-strength';
            else if (s < 77)
                return 'ok-strength';
            else if (s < 86)
                return 'good-strength';
            else if (s < 94)
                return 'verygood-strength';
            else
                return 'excellent-strength';
        }
    },
    methods: {
        refreshPassphrase: function() {
            var vm = this;

            fetch(this.apiurl).then(function(resp) {
                return resp.json();
            }).then(function(json) {
                vm.words = json.words;
                vm.unique_prefix = json.unique_prefix;
                vm.strength_score = json.strength;
                vm.entropy = Math.round(json.entropy);
            }).catch(function() {
                vm.errorMessage = 'Failed to load your passphrase, sorry :(';
            });
        },
        updateLocation: function() {
            window.location.replace('#'+this.path);
        },
        updateDataFromHash: function() {
            var hash = window.location.hash;

            if (hash) {
                var [type, strength] = hash.substring(1).split('/');
                this.zipable = type === 'xpass';
                if (this.strength_choices.includes(strength)) {
                    this.strength = strength;
                } else {
                    this.strength_index = 0;
                }
            } else {
                this.zipable = false;
                this.strength_index = 0;
            }
        },
        stepup: function() {
            if (!this.isMaxStrength)
                this.strength_index++;
        },
        stepdown: function() {
            if (this.strength_index > 0)
                this.strength_index--;
        },
        toggleZipable: function() {
            this.zipable = !this.zipable;
        },
        setKeybindings: function() {
            document.addEventListener('keydown', (ev) => {
                if (!ev.ctrlKey) {
                    if (ev.shiftKey) {
                        if (ev.key === 'R') {
                            this.refreshPassphrase();
                        } else if (ev.key === 'X') {
                            this.zipable = !this.zipable;
                        }
                    } else if (ev.altKey) {
                        if (ev.key === 'ArrowUp') {
                            this.stepup();
                        } else if (ev.key === 'ArrowDown') {
                            this.stepdown();
                        }
                    }
                }
            });
        }
    },
    watch: {
        apiurl: function() {
            this.refreshPassphrase();
        },
        path: function() {
            this.updateLocation();
        }
    }
});
