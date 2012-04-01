all: git-hooks webroot/swf/HTTPGet.swf

run: all
	( cd webroot; python -m SimpleHTTPServer )

lint:
	python git-tools/lint.py

git-hooks:
	python git-tools/setupGitHooks.py

clean:
	rm -rf webroot/swf


webroot/swf/HTTPGet.swf: src/HTTPGet.as
	mxmlc -benchmark=True -creator=jfly -static-link-runtime-shared-libraries=true -output=$@ $^
