(function(){

	var 
		watchList = {}
		, fs = require('fs')
		, path = require('path')
		, exec = require('child_process').exec
		, bundleMaker = __dirname + "/bin/make_bundle"
		, debugMode = process.env.NODE_ENV == "development" ? true : false
		, EventEmitter = require('events').EventEmitter
		, bundler = Object.create(EventEmitter.prototype)
	;

	var box = function box(bundleBox, cb){

		if(!(bundleBox) || (bundleBox.length<1)){

			cb(new Error("Invalid bundle parameters"));
			return;
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

				if(!indexStat.isFile() && !error){

					error = "Bundle index is not a file.";
				}

				else if(!outputStat.isDirectory() && !error){

					error = "Bundle output is not a directory.";
				}

				if(error){

					bundle.error = error;
					bundler.emit("bundle::error", bundle);

					return;
				}

				bundle.index = index;
				bundle.output = output;
				createBundle(title, bundle);

				// if watch is true, or we're in dev mode & no one explicitly told us not to...
				if(bundle.watch == true || 
					((process.env.NODE_ENV == "development") && 
						(bundle.watch != false))){

					watchSource(title, bundle);
				}
			}		
		}

		if(typeof cb === "function") { cb(null); } // this just means we processed things properly, errors may happen.

		return bundler;
	}

	var createBundle = function(bundleName, bundle){

		var command = [

			bundleMaker
			, "--index"
			, bundle.index
			, "--output"
			, bundle.output
			, bundle.uglify ? "--uglify" : ""

		].join(" ");

		exec(command, function(err, stdout, stderr){

			var status = "success";

			if(err){ 

				stats = "failed"; 
				bundle.error = err; 
			}

			bundler.emit("bundle::" + status, bundle);
		});
		
	}

	var watchSource = function(bundleName, bundle){

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

					createBundle(bundleName, bundle);
					clearTimeout(watchList[bundleName]);
					watchList[bundleName] = undefined;

				}, 500); 
			}
		});	
	}

	module.exports = box;
})()