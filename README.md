# Aperture

Reusable JS, CSS, and HTML to be used in the various portals created at Monstercat.

## Install

1. Put it in your `package.json`

    dependencies: {
      "aperture": "https+ssh//git@github.com/monstercat/aperture"
    }

2. run `npm install`

3. Include the aperture folder in your ExpressJS app file as a static dir.

    app.use(express.static(path.join("node_modules"))
    
4. Put it in your head HTML file by pointing to that static folder

    <script type="text/javascript src="/aperture/js/declare.js"></script>
