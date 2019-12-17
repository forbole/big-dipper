.DEFAULT_GOAL := dev

.PHONY: dev

dev:
	docker-compose -f Docker/dev.docker-compose.yml up --build

dev-down:
	docker-compose -f Docker/dev.docker-compose.yml down

prod:
	docker-compose -f Docker/prod.docker-compose.yml up --build

prod-down:
	docker-compose -f Docker/prod.docker-compose.yml down

builder:
	docker build -f Docker/builder/Dockerfile . -t builder
