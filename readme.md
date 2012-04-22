### fanciful features:

 * bundling occurs in separate processes to avoid blocking the app

 * watches for source changes & re-bundles (optional)

 * easily configure multiple source files to bundle

 * emits bundle events (success, failed)

 * emits source events (change, rename)

***
### example usage:

 * *the following example will produce two separate bundles for browser consumption (`client-bundle.js`, and `admin-bundle.js`).*
 * *each bundle uses the index specified as the entry point for client-side execution (no additional `<script>` tags needed).*
 * *any modules required by the index module are automatically bundled. (via [browserify](https://github.com/substack/node-browserify) AST magic).*

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
		}, {
			rsync : {

				resource : "emily@sunset:/var/www/"
				, options : "-caqz --delete"
				, directory : __dirname + '/../public/js/'
			}
		});

		bundle.on("bundle::success", function(pack){

			// huzzah~!1
		});

		bundle.on("bundle::failed", function(pack){

			// not so huzzah.
		});

		bundler.on("rsync::success", function(info){

			// do something about the success
		});

		bundler.on("rsync::failed", function(info){

			// do something about the failure
		});
		
		bundler.on("rsync::stdout", function(stdout){

			// do stuff w/ stdout
		});

		bundler.on("rsync::stderr", function(stderr){

			// do stuff w/ stderr
		});				

***
### dependencies:

 * [browserify](https://github.com/substack/node-browserify)
 * [optimist](https://github.com/substack/node-optimist)
 * [uglify-js](https://github.com/mishoo/UglifyJS)

***
### mega thanks:

[SubStack](https://github.com/substack) is the coolest robot I know.
I would like to thank him for writing the libs that this little package wrapper relies upon!

01010011 01010101 01000010 01010011
01010100 01000001 01000011 01001011 
00100000 01001001 01010011 00100000 
01000010 01000101 01010011 01010100 
01010011 01010100 01000001 01000011 
01001011
