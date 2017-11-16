# Aperture

Reusable JS, CSS, and HTML to be used in the various portals created at Monstercat.

## Install

```
npm install git+https://github.com/monstercat/aperture.git --save
```

## Usage

### Serve 

You can serve the directory by mounting the folder, symlinking it, or how ever you feel.

#### Example with Express

```
app.use(express.static(path.join("node_modules", "aperture")))
```

### Link in HTML

Import desired tools in your HTML head section.

```
<script type="text/javascript src="/aperture/js/helpers.js"></script>
<link rel="stylesheet" type="text/css" href="/aperture/css/main.css">
...
```

