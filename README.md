# Page Pack

A simple tool to create static sites.

Put a series of js files that return a string of HTML in a folder (`pages` by default).

Then run:

```
pagepack [input-dir] --out-dir [output target] --public-dir [public files]
```

Output directory defaults to `dist`, public directory defaults to `public`.

To watch the folder & start a live server, install `live-server` and `nodemon`, then run (or add to your scripts):

```
nodemon --ignore ./dist --ext '*' --exec 'npx pagepack' & live-server dist
```
