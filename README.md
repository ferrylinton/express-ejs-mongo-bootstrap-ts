# Simple Express Web Application With EJS, MongoDB, Bootstrap and Typescript

### Update Library

Check the latest versions of all project dependencies

```
npx npm-check-updates
```

Upgrading package.json

```
npx npm-check-updates -u
```

Choose which packages to update in interactive mode

```
npx npm-check-updates -i
```

### Installation

Install the dependencies:

```bash
npm install
```

### Development

Start the development server with HMR:

```bash
npm run dev
```

Your application will be available at `http://localhost:5173`.

## Building for Production

Create a production build:

```bash
npm run build
```

## Running Application In Development Environment

1.  Add **_.env_** file and add all configuration from **_.env.dev.sample_**

1.  Run application

    ```console
    npm run dev
    ```

## Running Application In Production Environment

1.  Add **_.env_** file and add all configuration from **_.env.prod.sample_**

1.  Build source code

    ```console
    npm run build
    ```

1.  Start application with pm2

    ```console
    pm2 start ecosystem.config.cjs
    ```
