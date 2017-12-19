var app = new Vue({
    el: '#app',
    created: function() {
        this.updateDataFromHash();
    },
    data: {
        words: [],
        entropy: 0,
        unique_prefix: null,
        strength_score: 0,
        strength: null,
        zipable: false,
    },
    computed: {
        apiurl: function() {
            let path = '/api/passphrase/' + this.strength;

            if (this.zipable) path += '?zipable=1';

            return path;
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
                this.strength = strength;
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
