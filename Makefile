
IMAGE_NAME = ghcr.io/xieyt/copybara-bin

build-sync:
	@echo "Building docker images ghcr.io/xieyt/copybara-bin"
	# here run npm install in directory .github/sync-repo
	. "/home/water/.nvm/nvm.sh" && node --version
	if [[ ! -d 'node_modules' ]]; then npm install ; fi
	npm run build
	git add ./dist/. && git commit -m "build - $(date '+%Y-%m-%d %H:%M:%S')"

build-docker-image:
	@echo "Building docker image $(IMAGE_NAME)"
	docker build --load -t $(IMAGE_NAME) .github/.
	docker push $(IMAGE_NAME)

.PHONY: build-sync
