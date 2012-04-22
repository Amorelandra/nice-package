### fanciful features:

 * supports uploading bundles to asset servers via rsync

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
### note:

rsync support requires manual ssh key configuration as of now. e.g.

 * on your development box; `cd ~/.ssh` (create and `chmod 700` if it doesn't exist)
 * generate a new ssh key (security first, kids!); `ssh-keygen -t rsa -f asset_key`
 * copy the contents of `asset_key.pub` to `~/.ssh/authorized_keys` on the asset server
 * create an entry in `~/.ssh/config` on your development box with the following;

 		Host <hosts nickname>
 			User <your username>
 			HostName <your server's host>
 			IdentityFile ~/.ssh/asset_key.pub
 * edit your options hash to point to the appropriate asset server

 		{
			rsync : {
				resource : "<your username>@<host's nickname>:<asset directory>"
				, options : "-caqz --delete" // or whatever you prefer
				, directory : __dirname + '/../public/js/' // source of bundles
		}
 * confidently sync your assets with poise and grace

***
### dependencies:

 * [browserify](https://github.com/substack/node-browserify)
 * [optimist](https://github.com/substack/node-optimist)
 * [uglify-js](https://github.com/mishoo/UglifyJS)
 * [async](https://github.com/caolan/async)

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
