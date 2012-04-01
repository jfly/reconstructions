all: git-hooks

run: all
	( cd webroot; python -m SimpleHTTPServer )

lint:
	python git-tools/lint.py

lint-all:
	python git-tools/lint.py -a

git-hooks:
	python git-tools/setupGitHooks.py

clean:
	rm -rf webroot/swf
