(function(){

	var 
		watchList = {}
		, fs = require('fs')
		, path = require('path')
		, async = require('async')
		, exec = require('child_process').exec
		, spawn = require('child_process').spawn
		, bundleMaker = path.resolve(__dirname + "/bin/make_bundle")
		, debugMode = process.env.NODE_ENV == "development" ? true : false
		, EventEmitter = require('events').EventEmitter
		, bundler = Object.create(EventEmitter.prototype)
		, bundleOptions = {}
		, bundleList = []
	;

	var box = function box(bundleBox, options){

		if(!(bundleBox) || (bundleBox.length<1)){

			cb(new Error("Invalid bundle parameters"));
			return;
		}	

		if(options){ 

			// TODO: parse options moar.

			bundleOptions = options 
		}

		for(var title in bundleBox){

			var bundle = bundleBox[title];

			if((bundle.index) && (bundle.output)){

				try{


					var 
						index = path.resolve(bundle.index)
						, output = path.resolve(bundle.output)
						, indexStat = fs.statSync(path.resolve(index))
						, outputStat = fs.statSync(path.dirname(output))
						, error = null;
					;
				}
				catch(e){

					error = e.toString();
				}

				if((!indexStat) || !indexStat.isFile() && !error){

					error = "Bundle index is not a file.";
				}

				else if((!outputStat) || (!outputStat.isDirectory() && !error)){

					error = "Bundle output is not a directory.";
				}

				bundle.index = index;
				bundle.output = output;

				if(error){

					bundle.error = error;
				}
				
				bundleList.push(createBundler(title, bundle));


				// if watch is true, or we're in dev mode & no one explicitly told us not to...
				if(bundle.watch == true || 
					((process.env.NODE_ENV == "development") && 
						(bundle.watch != false))){

					bundleList.push(watchSource(title, bundle));
				}
			}		
		}

		bundler.emit('bundle::success', { index : bundleList });

		async.parallel(bundleList, function(err, res){

			if(err){

				bundler.emit("bundle::error", err);
			}

			boxComplete(res, options);
		});

		if(typeof cb === "function") { cb(null); } // this just means we processed things properly, errors may happen.

		return bundler;
	}

	var createBundler = function(bundleName, bundle){

		return function(cb){

			var command = [

				bundleMaker
				, "--index"
				, bundle.index
				, "--output"
				, bundle.output
				, bundle.uglify ? "--uglify" : ""

			].join(" ");

			exec(command, function(err, stdout, stderr){

				var 
					status = "success"
				;

				if(err){ 

					status = "failed";
					bundle.error = err; 
				}

				bundler.emit("bundle::" + status, bundle);

				if(typeof cb === "function"){ cb(err ? err : null, bundle.output || undefined); }
			});
		}
	}

	var watchSource = function(bundleName, bundle){

		return function(cb){

			var 
				watchDir = path.dirname(bundle.index)
				, error = false
			;

			try{

				if(!fs.statSync(watchDir).isDirectory()){

					error = true;
				}
			}
			catch(e){

				error = true;
			}

			if(error) { bundler.emit("watch::error", bundle); return; }

			fs.watch(path.dirname(bundle.index), function(event, filename) {


				if((event) && (filename)){

					bundler.emit("source::" + event, {

						bundleName : bundleName
						, bundleOptions : bundle
						, sourceFile : filename

					});

					if(watchList[bundleName]){ clearTimeout(watchList[bundleName]); }

					// timeout to prevent mass bundling on git actions
					watchList[bundleName] = setTimeout(function(){ 

						boxComplete(createBundler(bundleName, bundle)(), bundleOptions);
						clearTimeout(watchList[bundleName]);
						watchList[bundleName] = undefined;

					}, 500); 
				}
			});	

			cb(error);
		}
	}

	var boxComplete = function(res, options){

		if((options) && options.rsync){

			if(!options.rsync.directory){ 

				bundler.emit("rsync::failed", new Error("No rsync directory")); 
				return; 
			}

			var 
				resource = options.rsync.resource
				, args = options.rsync.options
				, directory = path.resolve(options.rsync.directory)
				, command = ["rsync", args, directory, resource].join(" ")
				// , inc = function(f){ return "--include=" + f; }
				// , files = res.map(function(f){ return inc(f); }).join(" ")
			;

			exec(command, function(err, stdout, stderr){

				if(stdout){ bundler.emit("rsync::stdout", stdout); }
				if(stderr){ bundler.emit("rsync::stderr", stderr); }

				bundler.emit("rsync::" + err ? "failed" : "success", res);
			});		
		}
	}

	module.exports = box;
})()