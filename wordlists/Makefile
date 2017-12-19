GEN=genwordlist
LEXFILE=Lexique381.txt
EXCFILE=exclude_words.txt
NONASCII_FLAGS=--char-regex=[a-zàéîôùç]
NODICE_FLAGS=--no-print-dices
FLAGS=-d

.PHONY: all

all: wordlist_fr_4k.txt wordlist_fr_3k.txt wordlist_fr_4d_3.txt

wordlist_fr_4k.txt: $(LEXFILE)
	$(GEN) --limit=4096 -M7 -V5 -x $(EXCFILE) $< -o $@ $(FLAGS) $(NODICE_FLAGS)

wordlist_fr_3k.txt: $(LEXFILE)
	$(GEN) --limit=3072 -M6 -V5 -x $(EXCFILE) $< -o $@ $(FLAGS) $(NODICE_FLAGS)

wordlist_fr_4d_2.txt: $(LEXFILE)
	$(GEN) -n4 -m4 -M10 -p3 $< -o $@ $(FLAGS)

