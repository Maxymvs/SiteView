# Rules for Bun Development

## General Guidelines

1. Use Bun as the primary runtime and package manager for this project.
2. Leverage Bun's all-in-one toolkit: runtime, package manager, test runner, and bundler.
3. Take advantage of Bun's native TypeScript and JSX support without additional configuration.
4. Utilize Bun's drop-in replacement for Node.js APIs for maximum compatibility.
5. Use Bun's Web-standard APIs (fetch, WebSocket, ReadableStream) for modern development practices.
6. Implement Bun's built-in test runner for fast, TypeScript-first testing.
7. Use `bunfig.toml` for project-specific configuration when needed.
8. Leverage Bun's watch mode for development workflows.
9. Take advantage of Bun's 4x faster startup times compared to Node.js.
10. Use Bun's global cache and workspaces for efficient dependency management.

## Installation and Setup

1. Install Bun using the recommended method for your platform:
    
    ```bash
    # macOS, Linux, and WSL
    curl -fsSL https://bun.sh/install | bash
    
    # Windows (PowerShell)
    powershell -c "irm bun.sh/install.ps1 | iex"
    
    # Using npm (if already installed)
    npm install -g bun
    
    # Using Homebrew (macOS)
    brew tap oven-sh/bun
    brew install bun
    
    ```
    
2. Verify installation:
    
    ```bash
    bun --version
    
    ```
    
3. Initialize a new project with Bun:
    
    ```bash
    bun init
    
    ```
    

## Package Management

1. Install dependencies using Bun's package manager (up to 30x faster than npm):
    
    ```bash
    bun install
    
    ```
    
2. Add new packages:
    
    ```bash
    bun add <package-name>
    bun add -d <package-name>  # Add as dev dependency
    bun add -g <package-name>  # Add globally
    
    ```
    
3. Remove packages:
    
    ```bash
    bun remove <package-name>
    
    ```
    
4. Update packages:
    
    ```bash
    bun update
    bun update <package-name>  # Update specific package
    
    ```
    
5. Use Bun's global cache for faster installs across projects.
6. Leverage workspaces for monorepo setups:
    
    ```json
    // package.json
    {
      "workspaces": ["packages/*"]
    }
    
    ```
    
7. Use package overrides when needed:
    
    ```json
    // package.json
    {
      "overrides": {
        "foo": "1.0.0"
      }
    }
    
    ```
    
8. Run security audits:
    
    ```bash
    bun pm audit
    
    ```
    

## Running Scripts

1. Execute TypeScript and JSX files directly without compilation:
    
    ```bash
    bun run index.tsx
    bun run server.ts
    
    ```
    
2. Run package.json scripts:
    
    ```bash
    bun run start
    bun run dev
    bun run build
    
    ```
    
3. Use `bunx` to execute packages without installing (like npx):
    
    ```bash
    bunx prettier --write .
    bunx create-next-app my-app
    
    ```
    
4. Run scripts with watch mode for auto-reloading:
    
    ```bash
    bun --watch index.ts
    
    ```
    

## Runtime and Execution

1. Use Bun as a drop-in replacement for Node.js:
    
    ```typescript
    // index.ts
    console.log('Hello from Bun!');
    
    ```
    
    ```bash
    bun run index.ts
    
    ```
    
2. Leverage native TypeScript support without tsconfig.json (though recommended for IDE support):
    
    ```typescript
    interface User {
      id: number;
      name: string;
    }
    
    const user: User = {
      id: 1,
      name: 'John Doe'
    };
    
    console.log(user);
    
    ```
    
3. Use JSX/TSX directly:
    
    ```tsx
    function App() {
      return <div>Hello from Bun!</div>;
    }
    
    ```
    
4. Import both ESM and CommonJS modules seamlessly:
    
    ```typescript
    // ESM
    import { readFile } from 'fs/promises';
    
    // CommonJS
    const path = require('path');
    
    ```
    

## HTTP Server

1. Use Bun's built-in HTTP server for high performance:
    
    ```typescript
    const server = Bun.serve({
      port: 3000,
      fetch(request) {
        return new Response('Hello from Bun!');
      },
    });
    
    console.log(`Listening on http://localhost:${server.port}`);
    
    ```
    
2. Implement routing:
    
    ```typescript
    Bun.serve({
      port: 3000,
      fetch(request) {
        const url = new URL(request.url);
        
        if (url.pathname === '/') {
          return new Response('Home page');
        }
        
        if (url.pathname === '/api/users') {
          return Response.json({ users: [] });
        }
        
        return new Response('Not found', { status: 404 });
      },
    });
    
    ```
    
3. Handle different HTTP methods:
    
    ```typescript
    Bun.serve({
      port: 3000,
      async fetch(request) {
        const url = new URL(request.url);
        
        if (request.method === 'GET' && url.pathname === '/api/data') {
          return Response.json({ data: 'example' });
        }
        
        if (request.method === 'POST' && url.pathname === '/api/data') {
          const body = await request.json();
          return Response.json({ success: true, data: body });
        }
        
        return new Response('Method not allowed', { status: 405 });
      },
    });
    
    ```
    
4. Work with cookies:
    
    ```typescript
    Bun.serve({
      fetch(request) {
        const cookie = request.headers.get('Cookie');
        
        return new Response('Hello', {
          headers: {
            'Set-Cookie': 'session=abc123; Path=/; HttpOnly',
          },
        });
      },
    });
    
    ```
    
5. Implement TLS/HTTPS:
    
    ```typescript
    Bun.serve({
      port: 3443,
      tls: {
        cert: Bun.file('./cert.pem'),
        key: Bun.file('./key.pem'),
      },
      fetch(request) {
        return new Response('Secure connection!');
      },
    });
    
    ```
    

## File I/O

1. Use Bun's optimized file APIs:
    
    ```typescript
    // Read file
    const file = Bun.file('package.json');
    const contents = await file.text();
    
    // Read as JSON
    const json = await file.json();
    
    // Read as ArrayBuffer
    const buffer = await file.arrayBuffer();
    
    ```
    
2. Write files efficiently:
    
    ```typescript
    await Bun.write('output.txt', 'Hello, Bun!');
    await Bun.write('data.json', JSON.stringify({ key: 'value' }));
    
    ```
    
3. Use Node.js compatible fs APIs when needed:
    
    ```typescript
    import { readFile, writeFile } from 'fs/promises';
    
    const data = await readFile('input.txt', 'utf-8');
    await writeFile('output.txt', data);
    
    ```
    

## Testing

1. Use Bun's built-in test runner (Jest-compatible):
    
    ```typescript
    // math.test.ts
    import { expect, test, describe } from 'bun:test';
    
    describe('Math operations', () => {
      test('addition', () => {
        expect(2 + 2).toBe(4);
      });
      
      test('subtraction', () => {
        expect(5 - 3).toBe(2);
      });
    });
    
    ```
    
2. Run tests:
    
    ```bash
    bun test
    bun test math.test.ts  # Run specific test file
    bun test --watch       # Watch mode
    
    ```
    
3. Use test lifecycle hooks:
    
    ```typescript
    import { beforeAll, beforeEach, afterAll, afterEach, test } from 'bun:test';
    
    beforeAll(() => {
      // Setup before all tests
    });
    
    beforeEach(() => {
      // Setup before each test
    });
    
    afterEach(() => {
      // Cleanup after each test
    });
    
    afterAll(() => {
      // Cleanup after all tests
    });
    
    test('example test', () => {
      // Test code
    });
    
    ```
    
4. Test async code:
    
    ```typescript
    import { test, expect } from 'bun:test';
    
    test('async function', async () => {
      const result = await fetchData();
      expect(result).toBeDefined();
    });
    
    ```
    
5. Use snapshots:
    
    ```typescript
    import { test, expect } from 'bun:test';
    
    test('snapshot', () => {
      const data = { name: 'John', age: 30 };
      expect(data).toMatchSnapshot();
    });
    
    ```
    

## Environment Variables

1. Access environment variables using `process.env`:
    
    ```typescript
    const apiKey = process.env.API_KEY;
    const port = process.env.PORT || 3000;
    
    ```
    
2. Use `.env` files (automatically loaded by Bun):
    
    ```bash
    # .env
    API_KEY=your-api-key
    DATABASE_URL=postgresql://localhost/mydb
    
    ```
    
3. Access in code:
    
    ```typescript
    console.log(process.env.API_KEY);
    
    ```
    
4. Use different env files:
    
    ```bash
    bun --env-file=.env.production run index.ts
    
    ```
    

## Bundling

1. Bundle for production:
    
    ```bash
    bun build ./index.tsx --outdir ./dist
    
    ```
    
2. Bundle with options:
    
    ```bash
    bun build ./index.ts --outdir ./dist --minify --sourcemap=external
    
    ```
    
3. Bundle for browsers:
    
    ```bash
    bun build ./client.tsx --outdir ./public --target=browser
    
    ```
    
4. Use the JavaScript API for advanced bundling:
    
    ```typescript
    await Bun.build({
      entrypoints: ['./index.ts'],
      outdir: './dist',
      minify: true,
      sourcemap: 'external',
      target: 'node',
      splitting: true,
    });
    
    ```
    

## Configuration

1. Create a `bunfig.toml` file in your project root for custom configuration:
    
    ```toml
    # Set default framework
    [install]
    # Default registry
    registry = "https://registry.npmjs.org"
    
    # Scoped registries
    [install.scopes]
    "@mycompany" = "https://registry.mycompany.com"
    
    # Development dependencies to exclude in production
    [install]
    production = false
    
    # Set test preferences
    [test]
    preload = ["./setup.ts"]
    
    ```
    
2. Configure module resolution:
    
    ```toml
    [module]
    # Set path aliases
    [module.alias]
    "@components" = "./src/components"
    "@utils" = "./src/utils"
    
    ```
    

## Debugging

1. Use Bun's built-in debugger:
    
    ```bash
    bun --inspect index.ts
    bun --inspect-brk index.ts  # Break on first line
    
    ```
    
2. Use Chrome DevTools or VS Code debugger for debugging.
3. Add debug configuration to VS Code:
    
    ```json
    {
      "version": "0.2.0",
      "configurations": [
        {
          "type": "node",
          "request": "launch",
          "name": "Debug Bun",
          "runtimeExecutable": "bun",
          "runtimeArgs": ["--inspect-brk", "index.ts"],
          "console": "integratedTerminal",
          "internalConsoleOptions": "neverOpen"
        }
      ]
    }
    
    ```
    

## Web APIs

1. Use Web-standard `fetch`:
    
    ```typescript
    const response = await fetch('https://api.example.com/data');
    const data = await response.json();
    
    ```
    
2. Work with WebSockets:
    
    ```typescript
    const ws = new WebSocket('ws://localhost:3000');
    
    ws.addEventListener('open', () => {
      ws.send('Hello server!');
    });
    
    ws.addEventListener('message', (event) => {
      console.log('Received:', event.data);
    });
    
    ```
    
3. Use Streams API:
    
    ```typescript
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue('chunk 1');
        controller.enqueue('chunk 2');
        controller.close();
      },
    });
    
    ```
    

## SQLite Integration

1. Use Bun's built-in SQLite support:
    
    ```typescript
    import { Database } from 'bun:sqlite';
    
    const db = new Database('mydb.sqlite');
    
    // Create table
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT
      )
    `);
    
    // Insert data
    const insert = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)');
    insert.run('John Doe', 'john@example.com');
    
    // Query data
    const query = db.query('SELECT * FROM users');
    const users = query.all();
    console.log(users);
    
    // Close database
    db.close();
    
    ```
    
2. Use prepared statements for better performance:
    
    ```typescript
    const insert = db.prepare('INSERT INTO users (name, email) VALUES ($name, $email)');
    
    insert.run({
      $name: 'Jane Doe',
      $email: 'jane@example.com',
    });
    
    ```
    

## Performance Best Practices

1. Leverage Bun's fast startup times (4x faster than Node.js).
2. Use Bun's native APIs when available instead of npm packages.
3. Take advantage of automatic ESM and CommonJS interop.
4. Use `Bun.file()` for efficient file operations.
5. Implement streaming for large files:
    
    ```typescript
    const file = Bun.file('large-file.txt');
    const stream = file.stream();
    
    for await (const chunk of stream) {
      // Process chunk
    }
    
    ```
    
6. Use `Bun.write()` for optimized file writing.
7. Leverage Bun's global cache to reduce installation times.

## Integration with Next.js

1. Use Bun as the package manager for your Next.js project:
    
    ```bash
    bun create next-app my-app
    cd my-app
    bun install
    
    ```
    
2. Run Next.js development server with Bun:
    
    ```bash
    bun run dev
    
    ```
    
3. Build and start Next.js with Bun:
    
    ```bash
    bun run build
    bun run start
    
    ```
    
4. Note: While Bun can manage dependencies and run scripts, Next.js itself still uses its own server runtime.

## Common Commands Reference

```bash
# Package Management
bun install                  # Install dependencies
bun add <package>           # Add package
bun remove <package>        # Remove package
bun update                  # Update all packages

# Running Code
bun run <file>              # Run a file
bun run <script>            # Run package.json script
bun --watch <file>          # Run with auto-reload
bunx <package>              # Execute package (like npx)

# Testing
bun test                    # Run all tests
bun test --watch            # Run tests in watch mode
bun test <file>             # Run specific test

# Bundling
bun build <entry>           # Bundle code
bun build --minify          # Bundle and minify
bun build --watch           # Bundle with watch mode

# Utilities
bun init                    # Initialize new project
bun --version               # Show Bun version
bun upgrade                 # Upgrade Bun to latest version

```

## Migration from Node.js/npm

1. Replace `npm install` with `bun install`
2. Replace `npm run` with `bun run`
3. Replace `npx` with `bunx`
4. Keep existing `package.json` - Bun is compatible
5. Optional: Delete `node_modules` and reinstall with Bun for faster performance
6. Update scripts in `package.json` if needed (usually no changes required)

## Key Bun Features Summary

- **Fast Runtime**: 4x faster startup than Node.js
- **Native TypeScript/JSX**: No configuration needed
- **Fast Package Manager**: Up to 30x faster than npm
- **Built-in Test Runner**: Jest-compatible, TypeScript-first
- **Native Bundler**: Fast bundling without webpack/rollup
- **Web APIs**: Native fetch, WebSocket, ReadableStream
- **SQLite Built-in**: No external dependencies needed
- **Watch Mode**: Built-in file watching for development
- **Node.js Compatible**: Drop-in replacement for most Node.js apps

## Resources

- Official Documentation: https://bun.sh/docs
- GitHub Repository: https://github.com/oven-sh/bun
- Discord Community: https://bun.sh/discord
- Blog and Updates: https://bun.sh/blog

Remember to leverage Bun's speed and simplicity while maintaining compatibility with existing Node.js and npm ecosystem. Always refer to the [official Bun documentation](https://bun.sh/docs) for the most up-to-date information and best practices.

