ifeq ($(PATH_TO_METEOR_SETTINGS),)
PATH_TO_METEOR_SETTINGS := "./settings.json"
endif

METEOR_SETTINGS := $(shell cat ${PATH_TO_METEOR_SETTINGS} | sed 's/\n//g')

.DEFAULT_GOAL := dev

.PHONY: dev dev-down prod prod-down builder copy

dev:
	docker-compose -f Docker/dev.docker-compose.yml up --build

dev-down:
	docker-compose -f Docker/dev.docker-compose.yml down

prod:
	@echo ${PATH_TO_METEOR_SETTINGS}
	@echo ${METEOR_SETTINGS}
	#METEOR_SETTINGS='${METEOR_SETTINGS}' docker-compose -f Docker/prod.docker-compose.yml up --build

prod-down:
	docker-compose -f Docker/prod.docker-compose.yml down

builder:
	docker build -f Docker/builder/Dockerfile . -t builder

copy: builder
	@rm -f ./build/*
	docker create -ti --name builder_cp builder /bin/sh
	docker cp builder_cp:/output/mainchain-explorer.tar.gz ./build/mainchain-explorer.tar.gz
	docker rm -f builder_cp
