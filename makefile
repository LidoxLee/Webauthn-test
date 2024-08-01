.PHONY: run
run:
	@echo "start my-app dev"
	npm run dev:my-app


.PHONY: kill.client
kill.client:
	@echo "Killing processes on port 3000"
	kill -9 `lsof -t -i :3000` || true
	@echo "Killing processes on port 3001"
	kill -9 `lsof -t -i :3001` || true
	@echo "Done!"

