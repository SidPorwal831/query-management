# QueryManagement

## Features
* Add, view, and remove scheduled queries.
* Configure queries by selecting APIs, setting parameters, and choosing response attributes.
* Periodically execute queries based on user-defined intervals.
* Display query results in a separate view with real-time updates.

## Project Structure
* src/app/components/query-manager.component.ts: Handles adding and removing queries.
* src/app/query-results.component.ts: Handles the results of executed queries.
* src/app/services/query.service.ts: Manages API calls and query scheduling.
* db.json: Contains mock data for APIs and query testing.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.1.


## Development server

## Mock API Server Setup
The project uses a mocked backend (db.json) for testing API functionality. Start the mock API server using:

 * npx json-server --watch db.json --port 3000

 This will run the mock API server at http://localhost:3000


To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```


## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
