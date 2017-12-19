from flask import Flask, jsonify, request
from rolldice import rolldice
import math
import os.path

MIN_ENTROPY = 32
MAX_ENTROPY = 128
WORDLISTS_PATH = 'wordlists'
VALID_WORDLISTS = ['4k', '3k', '4d_3']

app = Flask(__name__)


def get_strength(entropy):
    q = 100 / (MAX_ENTROPY - MIN_ENTROPY)

    return round(math.log((entropy - MIN_ENTROPY) * q, 100) * 100)


def get_wordlist_path(name):
    if name not in VALID_WORDLISTS:
        raise Exception

    wordlist = 'wordlist_fr_{}.txt'.format(name)

    return os.path.join(WORDLISTS_PATH, wordlist)


def get_nbwords(wordlist, strength):
    # TODO: clean the mess
    strengths = ['base', 'strong', 'stronger', 'strongest']
    if wordlist in ['4k', '3k']:
        start_at = 4
    else:
        start_at = 5

    strength_dict = zip(strengths, range(start_at, start_at+len(strengths)))

    return {key: value for (key, value) in strength_dict}[strength]


def json_pass(listname, strength, unique_prefix=None):
    nbwords = get_nbwords(listname, strength)

    with open(get_wordlist_path(listname)) as f:
        words, entropy = rolldice(f, nb_words=nbwords)

    ret = {
        'words': words,
        'entropy': entropy,
        'strength': get_strength(entropy),
        'unique_prefix': unique_prefix
    }

    return jsonify(ret)


@app.route('/')
def index():
    return app.send_static_file('html/index.html')


@app.route('/api/passphrase')
@app.route('/api/passphrase/<strength>')
def passphrase(strength="base"):
    if request.args.get('zipable'):
        return json_pass('4d_3', strength, unique_prefix=3)

    if strength == 'base':
        listname = '4k'
    else:
        listname = '3k'

    return json_pass(listname, strength)


@app.route('/api/xpassphrase')
@app.route('/api/xpassphrase/<strength>')
def alt_passphrase(strength="base"):
    return json_pass('4d_3', strength, unique_prefix=3)
