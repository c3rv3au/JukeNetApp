/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var deviceId = null;

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
				$("#fb_btn").on("click",function(e) {
alert("pass");
					loginFb();
				});
				$("#loginForm").on("submit",function(e) {					
					$("#submitButton",this).attr("disabled","disabled");
					window.open("http://toutrix.com/jukenet?deviceId=" + deviceId,'_blank', 'location=no,toolbar=no,zoom=no');
					return false;
				});


				function success(uuid)
				{
						console.log(uuid);
						deviceId = uuid;
				};
				function fail(uuid)
				{
					console.log("Fail to get an uuid... " + uuid);
				};
				window.plugins.uniqueDeviceID.get(success, fail);
				initFbApp();
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        //var parentElement = document.getElementById(id);
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');

        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

var fbLoginSuccess = function (userData) {
	console.log("UserInfo: " + JSON.stringify(userData));
	//alert(JSON.stringify(userData));
	//alert(JSON.stringify(userData.authResponse.userID));
	window.open("http://toutrix.com/jukenet?fbUserId=" + userData.authResponse.userID,'_blank', 'location=no,toolbar=no,zoom=no');

/*
	navigator.geolocation.getCurrentPosition(function onSuccess(position) {
		alert("Got location");
		window.open("http://toutrix.com/jukenet?fbUserId=" + userData.authResponse.userID + "&loc=" + position.coords.latitude + "+" + position.coords.longitude + ",'_blank', 'location=no,toolbar=no,zoom=no');
	},
  function onError() {
		alert("No location");
		window.open("http://toutrix.com/jukenet?fbUserId=" + userData.authResponse.userID,'_blank', 'location=no,toolbar=no,zoom=no');
	});	
*/
}

function loginFb() {
	facebookConnectPlugin.login(["public_profile"],
	   fbLoginSuccess,
	   function (error) { initFbApp(); } // Re-do
	);
}
		 
function initFbApp() {
	console.log("initFbApp started");
	facebookConnectPlugin.getLoginStatus(function (status) {
		if (status.status == "connected") {
			fbLoginSuccess(status);
		} else {
			//loginFb();
		}
	}, function() {
		//loginFb();
	});

}

