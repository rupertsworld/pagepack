# Page Pack

A simple tool to create static sites. It uses regular old JavaScript functions.

Put a series of js files that return a string of HTML in a folder (`pages` by default). They can call import and call external functions, for example, you can wrap a page in a template with a `template(innerHTML)` function.

Then run:

```
pagepack [input-dir] --out-dir [output target] --public-dir [public files]
```

Defaults:

- Input directory: `pages`
- Public directory: `public`
- Output directory: `dist`

To watch the folder & start a live server, install `live-server` and `nodemon`, then run (or add to your scripts):

```
nodemon --ignore ./dist --ext '*' --exec 'npx pagepack' & live-server dist
```
