.DEFAULT_GOAL := dev


.PHONY: dev

dev:
	docker-compose -f Docker/dev.docker-compose.yml up --build

builder:
	docker build -f Docker/builder/Dockerfile .
