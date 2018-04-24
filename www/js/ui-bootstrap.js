// TouTrix UI Builder bootstrap

// Load the current manifest
var newManifest = null;
var nativePath = null;
var css_file_path = null;
var filesystem;

// Check if there is an update
function check(callback) {
	$('#ui-text').html("Vérification de mise à jour");
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
		},
    timeout: 10000
	});	
}

function download_css(callback) {
	$('#ui-text').html("Mise à jour du CSS");
	var fileTransfer = new FileTransfer();
	var uri = encodeURI("https://storage.googleapis.com/ui_src/" + project_id + "/app.css");
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
	$('#ui-text').html("Mise à jour de l'app");
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
	$('#ui-loader').hide();
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
	console.log("Device is ready");
	var the_dir = cordova.file.dataDirectory;
	if (device.platform == "iOS")
		the_dir = cordova.file.documentsDirectory;

	window.resolveLocalFileSystemURL(the_dir, function(dir) {
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
}
