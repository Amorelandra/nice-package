(function(){

	var 
		watchList = {}
		, fs = require('fs')
		, path = require('path')
		, exec = require('child_process').exec
		, bundleMaker = __dirname + "/lib/make_bundle"
		, debugMode = process.env.NODE_ENV == "development" ? true : false
		, EventEmitter = require('events').EventEmitter
		, bundler = Object.create(EventEmitter.prototype)
	;

	var box = function box(bundleBox, cb){

		if(!(bundleBox) || (bundleBox.length<1)){

			cb(new Error("bundle-bee::box() Invalid bundle parameters"));
			return;
		}		

		for(var title in bundleBox){

			var bundle = bundleBox[title];

			if((bundle.index) && (bundle.output)){

				createBundle(title, bundle);

				// if watch is true, or we're in dev mode & not explicitly told not to...
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
			
			if(err){

				bundler.emit("bundle::failed", bundle);
				return;
			}

			bundler.emit("bundle::success", bundle);
		});
		
	}

	var watchSource = function(bundleName, bundle){

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