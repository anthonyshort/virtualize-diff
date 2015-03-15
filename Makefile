
#
# Binaries.
#

export PATH := ./node_modules/.bin:${PATH}

#
# Wildcards.
#

lib = $(shell find index.js)
js = $(shell find index.js test/index.js )

#
# Default.
#

default: test

#
# Targets.
#

build.js: node_modules $(js)
	@browserify test/index.js > build.js

tests.js: node_modules $(js)
	@browserify test/index.js | bfc > tests.js

#
# Tests.
#

test:
	@mochify
.PHONY: test

test-browser: tests.js
	@duo-test browser --commands 'make tests.js'

test-cloud: tests.js
	@zuul -- tests.js

test-lint: $(lib)
	@jshint lib
.PHONY: lint

test-watch:
	@mochify --watch
.PHONY: watch

test-coverage:
	@mochify --cover
.PHONY: coverage

#
# Tasks.
#

node_modules: package.json
	@npm install

clean:
	@-rm -rf build.js tests.js dist
.PHONY: clean

distclean: clean
	@-rm -rf node_modules
.PHONY: distclean

#
# Releases.
#

release: clean
	bump $$VERSION && \
	git changelog --tag $$VERSION && \
	git commit --all -m "Release $$VERSION" && \
	git tag $$VERSION && \
	git push origin master --tags && \
	npm publish
.PHONY: release