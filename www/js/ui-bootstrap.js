// TouTrix UI Builder bootstrap

// Load the current manifest
var newManifest = null;
var nativePath = null;
var css_file_path = null;
var filesystem;

// Check if there is an update
function check(callback) {
	console.log("Checking for updates");
	var manifest = JSON.parse(localStorage.getItem('ui-manifest'));
	if (typeof manifest === "undefined" || manifest == null)
		manifest = {version: 0}

	$.ajax({
		type:     "GET",
		url:      "http://toutrix.com/ui_builder/manifest?project=" + project_id,
		dataType: "json",
		success: function(data){
			console.log(data);
			if (data.version != manifest.version) {
				newManifest = data;
				return callback(true);
			}
			return callback(false);
		},
		error: function(){
			console.log("Got an error downloading manifest.json");
			return callback(false);
		}
	});	
}

function download_css(callback) {
	var fileTransfer = new FileTransfer();
	var uri = encodeURI("http://toutrix.com/ui_builder/css?project=" + project_id);
	var fileURL = nativePath + "app.css";

	console.log("Writing app.css to: " + fileURL);
	fileTransfer.download(
	  uri,
	  fileURL,
	  function(entry) {
			console.log("download complete: " + entry.toURL());
			localStorage.setItem('css_url', fileURL);
			callback(null);
	  },
	  function(error) {
			console.log("app.css not downloaded.");
      console.log("download error source " + error.source);
      console.log("download error target " + error.target);
      console.log("download error code" + error.code);
			callback(error);
	  }
	);
}

// Update script
function update(callback) {
	console.log("Updating script");
	// Load the script
	$.ajax({
		type:     "GET",
		url:      "http://toutrix.com/ui_builder/load_app?project=" + project_id,
		dataType: "html",
		success: function(data){
			localStorage.setItem('appjs', data);
			localStorage.setItem('ui-manifest', JSON.stringify(newManifest));
			return download_css( function() {
				return callback(true);
			});
		},
		error: function(){
			console.log("Got an error downloading app.js");
			return callback(false);
		}
	});
}

function load() {
	console.log("Loading css");
	css_file_path = localStorage.getItem('css_url');
	if (css_file_path != null) {
		var fileref=document.createElement("link");
		fileref.setAttribute("rel", "stylesheet");
		fileref.setAttribute("type", "text/css");
		fileref.setAttribute("href", css_file_path);
		document.getElementsByTagName("head")[0].appendChild(fileref);
	}

	console.log("Loading script");
	var F=new Function (localStorage.getItem('appjs'));
	return(F());
}

document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
 setTimeout( function () {
	console.log("Device is ready");

	window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dir) {
		filesystem = dir;

		nativePath = dir.toURL();
		console.log('Native URI: ' + nativePath);

		check( function (is_update) {
			if (is_update) {
				update(function () {
					load();
				});
			} else {
				console.log("No updates found...");
				load();
			}
		});
	});
 }, 5000);
 var i = 0;
 var inte = setInterval( function () {
   console.log("Waiting");
   i++;
   if (i>=5) clearInterval(inte);
 }, 1000);
}