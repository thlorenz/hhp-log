BIN=./node_modules/.bin
BUDO=$(BIN)/budo

ENTRY=client.js

CSS=--css index.css

watch:
	$(BUDO) $(ENTRY) --live $(CSS) -- -d

watch-noreload:
	$(BUDO) $(ENTRY) $(CSS) -- -d
