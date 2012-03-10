***
### fanciful features:

 * bundling occurs in separate processes to avoid blocking the app

 * watches for source changes & re-bundles (optional)

 * easily configure multiple source files to bundle

 * emits bundle events (success, failed)

 * emits source events (change, rename)

### example usage:


		var NicePackage = require('nice-package');
		var bundle = NicePackage({

			client : { 

				index : './app/client/index.js' 
				, output : './public/js/client-bundle.js'
				, watch : true
				, uglify : true
			}
			, admin : {

				index : './app/client/admin/index.js'
				, output : './public/js/admin-bundle.js'
				, watch : true

			}
		});
		bundle.on("bundle::success", function(pack){

			// do stuff here
		});
		bundle.on("bundle::failed", function(pack){

			// do other stuff
		});

### dependencies:

 * [browserify](https://github.com/substack/node-browserify)
 * [optimist](https://github.com/substack/node-optimist)
 * [uglify-js](https://github.com/mishoo/UglifyJS)
