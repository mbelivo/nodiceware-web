from flask import Flask, jsonify, request
from rolldice import rolldice
import math
import os.path

MIN_ENTROPY = 32
MAX_ENTROPY = 128
WORDLISTS_PATH = 'wordlists'
VALID_WORDLISTS = ['4k', '3k', '4d_3', '5d', '4d_2']
STRENGTH_KEYWORDS = ['base', 'strong', 'stronger', 'strongest']

app = Flask(__name__)


def get_strength(entropy):
    q = 100 / (MAX_ENTROPY - MIN_ENTROPY)

    return round(math.log((entropy - MIN_ENTROPY) * q, 100) * 100)


def get_wordlist_path(name, lang='fr'):
    if name not in VALID_WORDLISTS:
        raise Exception

    wordlist = 'wordlist_{}_{}.txt'.format(lang, name)

    return os.path.join(WORDLISTS_PATH, wordlist)


def get_nbwords(wordlist, strength):
    # TODO: clean the mess
    if wordlist in ['4k', '3k', '5d']:
        start_at = 4
    else:
        start_at = 5

    strength_dict = zip(STRENGTH_KEYWORDS, range(start_at, start_at+len(STRENGTH_KEYWORDS)))

    return {key: value for (key, value) in strength_dict}[strength]


def json_pass(listname, strength, unique_prefix=None, lang='fr'):
    nb_words = get_nbwords(listname, strength)

    with open(get_wordlist_path(listname, lang)) as f:
        words, entropy = rolldice(f, nb_words=nb_words)

    ret = {
        'words': words,
        'entropy': entropy,
        'strength': get_strength(entropy),
        'unique_prefix': unique_prefix
    }

    return jsonify(ret)


@app.route('/')
def index():
    return app.send_static_file('dist/html/index.html')


@app.route('/api/passphrase')
@app.route('/api/passphrase/<lang>')
@app.route('/api/passphrase/<lang>/<strength>')
def passphrase(lang='fr', strength=None):
    if strength is None:
        if lang in STRENGTH_KEYWORDS:
            strength = lang
            lang = 'fr'
        else:
            strength = 'base'

    if request.args.get('zipable'):
        listname = '4d_3' if lang == 'fr' else '4d_2'

        return json_pass(listname, strength, unique_prefix=3, lang=lang)

    if lang == 'fr':
        listname = '4k' if strength == 'base' else '3k'
    else:
        listname = '5d'

    return json_pass(listname, strength, lang=lang)
