var app = new Vue({
    el: '#app',
    created: function() {
        this.updateDataFromHash();
    },
    data: {
        passphrase: {},
        strength: null,
        zipable: null,
    },
    computed: {
        apiurl: function() {
            let path = '/api/passphrase/' + this.strength;

            if (this.zipable) path += '?zipable=1';

            return path;
        },
        path: function() {
            return (this.zipable ? 'xpass' : 'pass') + '/' + this.strength;
        },
        entropy: function() {
            return Math.round(this.passphrase.entropy);
        },
        prefixes: function() {
            let prefix = this.passphrase.unique_prefix;

            if (!prefix) return [];

            return this.passphrase.words.map(function(word) {
                return word.substr(0, prefix);
            });
        },
        strengthClass: function() {
            var s = this.passphrase.strength;

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
                vm.passphrase = json;
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
                this.strength = strength || this.strength;
            } else {
                this.zipable = false;
                this.strength = 'base';
            }
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
