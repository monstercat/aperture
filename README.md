# Aperture

Reusable JS, CSS, and HTML to be used in the various portals created at Monstercat.

## Install

Put it in your `package.json`

    dependencies: {
      "aperture": "https+ssh//git@github.com/monstercat/aperture"
    }
    
Include the aperture folder in your ExpressJS app file as a static dir.

    app.use(express.static(path.join("node_modules"))
    
Put it in your head HTML file by pointing to that static folder

    <script type="text/javascript src="/aperture/js/declare.js"></script>
