# Page Pack

A simple tool to create static sites.

Put a series of js files that return a string of HTML in a folder (`pages` by default).

Then run:

```
pagepack [input-dir] --out-dir [output target] --public-dir [public files]
```

Output directory defaults to `dist`, public directory defaults to `public`.

```
nodemon --exec 'npx pagepack' & live-server dist
```
