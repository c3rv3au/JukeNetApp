var jukenet_url_backend = "http://toutrix.com";
var global_pos;
var ext_homepage_scope;
var intGetLive;

function millisecondsToStr (milliseconds) {
    // TIP: to find current time in milliseconds, use:
    // var  current_time_milliseconds = new Date().getTime();

    function numberEnding (number) {
        return (number > 1) ? 's' : '';
    }

    var temp = Math.floor(milliseconds / 1000);
    var years = Math.floor(temp / 31536000);
    if (years) {
        return years + ' year' + numberEnding(years);
    }
    //TODO: Months! Maybe weeks? 
    var days = Math.floor((temp %= 31536000) / 86400);
    if (days) {
        return days + ' day' + numberEnding(days);
    }
    var hours = Math.floor((temp %= 86400) / 3600);
    if (hours) {
        return hours + ' hour' + numberEnding(hours);
    }
    var minutes = Math.floor((temp %= 3600) / 60);
    if (minutes) {
        return minutes + ' minute' + numberEnding(minutes);
    }
    var seconds = temp % 60;
    if (seconds) {
        return seconds + ' second' + numberEnding(seconds);
    }
    return 'less than a second'; //'just now' //or other string you like;
}var needCordova = true;
console.log("loading app in progress");

console.log("loading css in progress");


// Initialize Firebase
var config = {
    apiKey: "AIzaSyDBuvaMWkChhzQEAMlwuKaeQe534jA2qsk",
    authDomain: "jukenet-1235.firebaseapp.com",
    databaseURL: "https://jukenet-1235.firebaseio.com",
    projectId: "jukenet-1235",
    storageBucket: "jukenet-1235.appspot.com",
    messagingSenderId: "226308297309"
};
firebase.initializeApp(config);

//var SERVER = 'http://toutrix.com/ui_builder/download?project=jukenet&filename=';
var SERVER = 'https://storage.googleapis.com/ui_src/jukenet/';
//if(location.host === 'localhost:3010'){
//  SERVER = 'http://localhost:3010/ui_builder/download?project=jukenet&filename=';
//}

function init_geo() {
	if (!navigator.geolocation) { console.log("No geo functions"); return; }
	navigator.geolocation.getCurrentPosition(function onSuccess(position) {
		console.log("Got GPS location : ");
		console.log(position.coords);
		global_pos = position.coords;
	},
  function onError() {
		console.log("No GPS location");
	});
}

console.log("Gooing to initialise templates");
var template_Concours = "<style>.mybtn{float:left;padding:15px;display:inline-block;}.mycontainer{display:flex;align-items:center;}.navbar-default {    background-color: #FF6600;    border-color: #E7E7E7;}.navbar-default .navbar-brand {    color: #FFFFFF;}</style><nav class=\"navbar navbar-default navbar-fixed-top\">  <div class=\"container-fluid\">    <div class=\"navbar-header navbar-default\">      <div>        <a class=\"mybtn btn btn-link btn-xs\" ng-click=\"retour()\"><i class=\"fa fa-arrow-circle-o-left fa-black\" style=\"font-size:2.5rem; color:blue;\" ></i></a>        <div class=\"navbar-brand\" ng-click=\"retour()\">Retour</div>      </div>    </div>  </div>           </nav><div class=\"container\"><br/><br/><h1>{{concour.name}}</h1> <div class=\"row\">  <div class=\"col-md-4\">    <div class=\"thumbnail\">        <img src=\"{{concour.thumbnail}}\" alt=\"Lights\" style=\"width:100%\">    </div>  </div> </div> <div class='location_banner'>	<p>{{concour.description}}</p>	<p>Nombre de gagnant: {{concour.nbr_winner}}</p>	<p>Date limite: {{concour.date_limite}}</p>	<p>Vous avez {{points}} points à ce concours.</p></div><div class=\"alert alert-danger\" role=\"alert\" ng-show=\"concour.finished\">  <span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=\"true\"></span>  <span class=\"sr-only\">Attention:</span>  Ce concour est terminé.</div><div class=\"row\" ng-hide='concour.finished'>	<div class=\"col-md-4\">		<div class=\"row\">			<div class=\"col-md-4 like_button\" ng-show='playEnabled'>					<a class=\"btn btn-primary btn-sm\" ng-click=\"play()\">						<span class=\"glyphicon glyphicon-plus\" aria-hidden=\"true\"></span> Je participe					</a>		  </div>			<div class=\"alert alert-info\" role=\"alert\" ng-hide='playEnabled'>				<span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=\"true\"></span>				<span class=\"sr-only\">Attention:</span>				Attendez un instant avant de pouvoir reparticiper. Et maximum {{concour.max_points_per_day}} points par jour.			</div><!--			<div class=\"col-md-4 like_button\" ng-hide=\"!is_enabled\">				<a class=\"btn btn-primary btn-sm\" ng-click=\"unplay()\">					<span class=\"glyphicon glyphicon-heart\" aria-hidden=\"true\"></span> Je ne veux plus participer				</a>		  </div>-->		</div>	</div></div><div class='top10'>  <p>Participants:</p>    <ul class=\"list-group search_group\">      <li class=\"search_item list-group-item list-group-item-success\" ng-repeat=\"result in participants track by $index\">        <div class=\"row\">          <img class='align_left' src='{{result.thumbnail}}' width='40' height='40'>          <div class='song_name'>{{result.name}} ({{result.points}})</div>        </div>      </li>    </ul></div><br/><br/><br/><br/><br/><br/><br/><div ng-show=\"isAdmin()\"></div>";
var template_Favorites = "<style>.mybtn{float:left;padding:15px;display:inline-block;}.mycontainer{display:flex;align-items:center;}.navbar-default {    background-color: #FF6600;    border-color: #E7E7E7;}.navbar-default .navbar-brand {    color: #FFFFFF;}</style><nav class=\"navbar navbar-default navbar-fixed-top\">  <div class=\"container-fluid\">    <div class=\"navbar-header navbar-default\">      <div>        <a class=\"mybtn btn btn-link btn-xs\" ng-click=\"retour()\"><i class=\"fa fa-arrow-circle-o-left fa-black\" style=\"font-size:2.5rem; color:blue;\" ></i></a>        <div class=\"navbar-brand\" ng-click=\"retour()\">Retour</div>      </div>    </div>  </div>           </nav>	<br/><br/>	<div class='search' id='search_box'>		  <form class=\"form\" role=\"search\">		    <div class=\"input-group add-on\">		      <input class=\"form-control ui-front input-lg\" placeholder=\"Recherche tes favories\" name=\"q\" id=\"srch-term\" type=\"text\" value=\"\" ng-model=\"searchText\" autocorrect=\"off\" autocapitalize=\"off\" spellcheck=\"false\">		    </div>		  </form>	</div>	<h1>Vous aimez</h1><img ng-if=\"dataLoading\" src=\"data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==\"/>	<div class='top10'>	  <ul class=\"list-group search_group\">	    <li class=\"search_item list-group-item list-group-item-success\" ng-repeat=\"result in likes | filter:searchText\">	     <div class=\"row\">            <div class=\"song_thumb\">         	<a ng-click=\"show_song(result)\"><img src='{{result.thumbnail.url}}' width='80'></a>		<div class=\"play_img_img\"></div>             </div><div class=\"\">	<div class='song_name'><a ng-click=\"show_song(result)\">{{result.title}}</a></div><!--          <div class='artist_name'><a ng-click=\"show_artist(result)\"></a></div>-->          <div class='artist_name'>{{result.artistName}}</div></div>                  </div>	    </li>	  </ul>	</div>	<h1>Vous n'aimez pas</h1><img ng-if=\"dataLoading\" src=\"data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==\"/>	<div class='top10'>	  <ul class=\"list-group search_group\">	    <li class=\"search_item list-group-item list-group-item-success\" ng-repeat=\"result in dislikes\">        <div class=\"row\">            <div class=\"song_thumb\">         	<a ng-click=\"show_song(result)\"><img src='{{result.thumbnail.url}}' width='80'></a>		<div class=\"play_img_img\"></div>             </div><div class=\"\">	<div class='song_name'><a ng-click=\"show_song(result)\">{{result.title}}</a></div><!--          <div class='artist_name'><a ng-click=\"show_artist(result)\"></a></div>-->          <div class='artist_name'>{{result.artistName}}</div></div>                  </div>	    </li>	  </ul>	</div>";
var template_Location = "<style>.mybtn{float:left;padding:15px;display:inline-block;}.mycontainer{display:flex;align-items:center;}.navbar-default {    background-color: #FF6600;    border-color: #E7E7E7;}.navbar-default .navbar-brand {    color: #FFFFFF;}.texte {	color: white;}</style><nav class=\"navbar navbar-default navbar-fixed-top\">  <div class=\"container-fluid\">    <div class=\"navbar-header navbar-default\">      <div>        <a class=\"mybtn btn btn-link btn-xs\" ng-click=\"retour()\"><i class=\"fa fa-arrow-circle-o-left fa-black\" style=\"font-size:2.5rem; color:blue;\" ></i></a>        <div class=\"navbar-brand\" ng-click=\"retour()\">Retour</div>      </div>    </div>  </div>           </nav><br/><br/><h1>{{show_location.name}}</h1><div class=\"chat_container\" ng-repeat=\"result in messages\">	<img src=\"{{result.photoURL}}\" alt=\"Avatar\">	<p>{{result.msg}}</p>	<span class=\"time-right\">{{result.hour}}</span></div><div ng-show=\"isAdmin()\"><h2>Connecté</h2><div ng-repeat=\"user in connected_users\">	<p><a ng-click=\"showUser(user)\">{{user.name}}</a></p>	<p><a ng-click=\"showUser(user)\"><img src='{{user.thumbnail}}' width='60' border=\"1\"></a></p></div><br/><h2>Stats</h2><p class='texte'>Dernière connexion le: {{ show_location.last_update_at * 1000 | date : format : timezone}}</p><p class='texte'>Nombre unique de connecté: {{unique_connected}} depuis 7 jours</p><br/><br/><div>	<p><input type=\"checkbox\" ng-model=\"dont_play\"> Don't play these categories if checked</p></div><div ng-repeat=\"category in categories\">	<p class='texte'>		<input type=\"checkbox\" ng-checked=\"exists(category.category, selected)\" ng-click=\"toggle(category.category, selected)\">{{category.category}} ({{category.nbr_song}} songs)	</p></div><a ng-click=\"save_category()\">>> Save <<</a><p>{{show_location.id}}</p><p><a ng-click=\"wipe_mp3()\">>> Wipe Space <<</a></p><p><a ng-click=\"remove_public()\">>> Remove public <<</a></p><div class=\"chat_container\" ng-repeat=\"result in logs\">	<p>{{result.message}}</p></div></div><br/><br/><br/>";
var template_Locations = "<style>.mybtn{float:left;padding:15px;display:inline-block;}.mycontainer{display:flex;align-items:center;}.navbar-default {	background-color: #FF6600;	border-color: #E7E7E7;}.navbar-default .navbar-brand {    color: #FFFFFF;}.server_disabled td {	background-color: #FF0000;}</style><nav class=\"navbar navbar-default navbar-fixed-top\">  <div class=\"container-fluid\">    <div class=\"navbar-header navbar-default\">      <div>        <a class=\"mybtn btn btn-link btn-xs\" ng-click=\"retour()\"><i class=\"fa fa-arrow-circle-o-left fa-black\" style=\"font-size:2.5rem; color:blue;\" ></i></a>        <div class=\"navbar-brand\" ng-click=\"retour()\">Retour</div>      </div>    </div>  </div>           </nav><br/><br/><img src=\"https://storage.googleapis.com/juke_imgs/JukeNet.png\" width='300'><br/><div ng-show=\"locations.length > 0\">	<table class=\"table table-dark\">		<thead>			<tr class=\"success\">				<th>Nom</th><th><img src=\"https://jukenet-1235.firebaseapp.com/img/users.ico\" width='20'></th><th><img src=\"https://jukenet-1235.firebaseapp.com/img/distance.png\" width='20'></th>			</tr>		</thead>		<tbody>			<!-- ng-class=\"location.enabled ? 'info' : 'server_disabled'\" -->      <tr class=\"info\" ng-repeat=\"location in locations\">        <td>					<span ng-class=\"location_class(location)\" style=\"color:{{location_color(location)}}\" ng-show=\"isAdmin()\"></span>						<a ng-click=\"showLocation(location)\">{{location.name}}</a>					</div>				</td>        <td><center>{{location.connected}}</center></td>        <td>{{location.distance}}</td>      </tr>      <tr class=\"info\" ng-show=\"isAdmin() && location\">        <td><a ng-click=\"showLocation(location)\">Current box</a></td>        <td><center>??</center></td>        <td>??</td>      </tr>    </tbody>	</table></div><div ng-show=\"locations.length == 0\">	<p>Veuillez patienter.</p></div><br/><br/><br/><br/><br/>";
var template_Search = "<style>.mybtn{float:left;padding:15px;display:inline-block;}.mycontainer{display:flex;align-items:center;}.navbar-default {    background-color: #FF6600;    border-color: #E7E7E7;}.navbar-default .navbar-brand {    color: #FFFFFF;}</style><nav class=\"navbar navbar-default navbar-fixed-top\">  <div class=\"container-fluid\">    <div class=\"navbar-header navbar-default\">      <div>        <a class=\"mybtn btn btn-link btn-xs\" ng-click=\"retour()\"><i class=\"fa fa-arrow-circle-o-left fa-black\" style=\"font-size:2.5rem; color:blue;\" ></i></a>        <div class=\"navbar-brand\" ng-click=\"retour()\">Retour</div>      </div>    </div>  </div>           </nav><br/><br/><br/><div class='search' id='search_box'>    <form class=\"form\" role=\"search\">      <div class=\"input-group add-on\">        <input class=\"form-control ui-front input-lg\" placeholder=\"Search\" name=\"q\" id=\"srch-term\" type=\"text\" value=\"\" ng-model='keyword2' autocorrect=\"off\" autocapitalize=\"off\" spellcheck=\"false\">        <div class=\"input-group-btn\">          <button class=\"btn btn-default\" ng-click=\"do_search()\"><i class=\"fa fa-search\"></i></button>        </div>      </div>    </form></div><img ng-if=\"dataLoading\" src=\"data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==\"/><div class='search_result' ng-show=\"results.length > 0\">  <h2>Résultat...</h2>  <ul class=\"list-group search_group\">    <li class=\"search_item list-group-item list-group-item-success\" ng-repeat=\"result in results\">      <div class=\"row rounded\">        <a ng-click=\"show_song(result)\"><img class='play_img' src='{{result.thumbnails.default.url}}' width='80'></a>				<div class=\"play_img_img\"></div>        <div class='song_name'><a ng-click=\"show_song(result)\">{{result.title}}</a> <img class=\"icone\" ng-class='getSongIcon(result.id)'></div>        <div class='artist_name	'>{{result.artistName}}</div><!--        <div class='artist_name'><a href=\"/#/artist/{{result.artisteId}}\">{{result.artist_name}}</a></div>        <a href=\"/#/artist/{{result.artisteId}}\"><img class='align_left' src='{{result.image_url}}' width='80'></a>        <div class='song_name'><a href=\"/#/artist/{{result.artisteId}}\">{{result.name}}</a></div>-->      </div>    </li>  </ul></div><div class='search_result' ng-show=\"no_result_show == 1\">  <h2>Desole. Aucune resultat trouve.</h2></div><script>var get_sugg = function(request, response) {  var term = request.term;  // get json 	$.ajax({	  dataType: \"json\",	  url: \"/jukenet_svc/auto_complete?q=\" + term,		  	success: function (results) {			//console.log(\"Auto complete response:\");			//console.log(results);			response(results.suggestions);		}	});}$('#srch-term').autocomplete({    source: get_sugg,		minLength: 2,		delay: 400,		appendTo: \"#search_box\",    select: function (event, ui) {				//console.log(ui);        //alert('You selected: ' + ui.item.value);		  ext_homepage_scope.$apply(function(){		      ext_homepage_scope.do_search(ui.item.value);		  })    }});</script>";
var template_ShowSong = "<style>.mybtn{float:left;padding:15px;display:inline-block;}.mycontainer{display:flex;align-items:center;}.navbar-default {    background-color: #FF6600;    border-color: #E7E7E7;}.navbar-default .navbar-brand {    color: #FFFFFF;}</style><nav class=\"navbar navbar-default navbar-fixed-top\">  <div class=\"container-fluid\">    <div class=\"navbar-header navbar-default\">      <div>        <a class=\"mybtn btn btn-link btn-xs\" ng-click=\"retour()\"><i class=\"fa fa-arrow-circle-o-left fa-black\" style=\"font-size:2.5rem; color:blue;\" ></i></a>        <div class=\"navbar-brand\" ng-click=\"retour()\">Retour</div>      </div>    </div>  </div>           </nav><br/><br/><br/><div class='top10'>  <p>{{song.artistName}} - {{song.title}}</p></div><div class='here' ng-show=\"isAdmin()\">	<label>Name:</label>	<input type=\"text\" ng-model=\"song.title\" placeholder=\"Name\" ng-required/>	<br/>	<button class=\"btn\" ng-click=\"saveTitle()\">Save</button>	<br/></div><div class=\"row\">	<div class=\"col-md-4\">    <div class=\"thumbnail\">      <img src=\"{{song.thumbnail.url}}\" alt=\"Lights\" style=\"width:100%\">    </div>  </div></div><div class=\"row\">	<div class=\"col-md-4\">		<span class=\"label label-info\" ng-repeat=\"cat in song.wiki_categories\" ng-if=\"cat != 'unknown'\">			{{cat}}			<a ng-show=\"isAdmin()\" ng-click=\"remove_cat(cat)\"><i class=\"remove glyphicon glyphicon-remove-sign glyphicon-white\"></i></a>		</span>		<span class=\"label label-info\" ng-show=\"isAdmin()\">			<a ng-click=\"openCat()\"><i class=\"remove glyphicon glyphicon-plus glyphicon-white\"></i></a>		</span>	</div></div><div class=\"row\" ng-show=\"isAdmin()\">	<div class=\"col-md-4\">		<br/>		<p>			Artiste:			<select ng-model=\"song.artistId\" ng-change=\"changeArtist()\" ng-options=\"a.id as a.name for a in artists\">				<option value=\"\">Select Artist</option>			</select>			<input type='text' ng-model=\"song.artist_name\">			<a ng-click=\"addArtist()\" class=\"btn\">Add</a>		</p>		<p>			Album:			<select ng-model=\"song.albumId\" ng-change=\"changeAlbum()\" ng-options=\"a.id as a.name for a in artist.albums\">				<option value=\"\">Select Album</option>			</select>			<input type='text' ng-model=\"song.album_name\">			<a ng-click=\"addAlbum()\" class=\"btn\">Add</a>		</p>	</div></div><div ng-show=\"show_categories\">	<div class='top10'>	  <p>Collaborator:</p>	</div>	<div ng-repeat=\"category in categories\">		<p class='texte'>			<a ng-click=\"addCat(category.category)\">{{category.category}} ({{category.nbr_song}} songs)		</p>	</div>	<hr/></div><div class=\"alert alert-success\" role=\"alert\" ng-show=\"song.asked\">  <span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=\"true\"></span>  Merci d'avoir fait la demande.</div><div class=\"alert alert-danger\" role=\"alert\" ng-show=\"song.status=='first'\">  <span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=\"true\"></span>  <span class=\"sr-only\">Attention:</span>  Cette chanson n'a jamais été demandé. Il se pourrait qu'elle ne puisse pas jouer.</div><!--<div ng-show=\"song.status!='first'\">	<audio controls preload=\"none\" controlsList=\"nodownload\"><source src=\"{{getAudioUrl()}}\" type=\"audio/mp3\">Your browser does not support the audio element.</audio></div>--><div class=\"alert alert-danger\" role=\"alert\" ng-show=\"show_error\">  <span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=\"true\"></span>  <span class=\"sr-only\">Error:</span>  {{error.message}}</div><div class=\"row\" ng-if=\"!dataLoading\">	<div class=\"col-md-4\">		<div class=\"row\">			<div class=\"col-md-4 like_button\">				<div ng-show=\"do_we_have_a_loc()\">					<a class=\"btn btn-primary btn-md btn-jukenet\" ng-click=\"request()\" ng-disabled='ask_enabled()'>						<span class=\"fa fa-plus-circle\" aria-hidden=\"true\"></span> Demande					</a>				</div>				<div class='artist_name' ng-hide=\"do_we_have_a_loc()\">						<p>JukeNet introuvable. Branche-toi au WiFi.</p>				</div>		  </div>			<div class=\"col-md-4 like_button\">				<a class=\"btn btn-primary btn-md btn-jukenet\" ng-click=\"like()\" ng-disabled=\"like_enabled()\">					<span class=\"fa fa-heart icon-red\" aria-hidden=\"true\"></span> {{like_button}}				</a>                      <div ng-show=\"like_enabled()\" class=\"dutexte\">Vous aimez cette chanson</div>		  </div>			<div class=\"col-md-4 like_button\">				<a class=\"btn btn-primary btn-md btn-jukenet\" ng-click=\"dislike()\" ng-disabled=\"dislike_enabled()\">					<span class=\"fa fa-minus-circle\" aria-hidden=\"true\"></span> J'aime pas				</a>		  </div><!--			<div class=\"col-md-4 like_button\">				<a class=\"btn btn-primary btn-md btn-jukenet\" ng-click=\"report()\">					<span class=\"glyphicon glyphicon-flag\" aria-hidden=\"true\"></span> Signaler				</a>		  </div>-->		</div>	</div></div><img ng-if=\"dataLoading\" src=\"data:image/gif;base64,R0lGODlhEAAQAPIAAP///wAAAMLCwkJCQgAAAGJiYoKCgpKSkiH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQJCgAAACwAAAAAEAAQAAADMwi63P4wyklrE2MIOggZnAdOmGYJRbExwroUmcG2LmDEwnHQLVsYOd2mBzkYDAdKa+dIAAAh+QQJCgAAACwAAAAAEAAQAAADNAi63P5OjCEgG4QMu7DmikRxQlFUYDEZIGBMRVsaqHwctXXf7WEYB4Ag1xjihkMZsiUkKhIAIfkECQoAAAAsAAAAABAAEAAAAzYIujIjK8pByJDMlFYvBoVjHA70GU7xSUJhmKtwHPAKzLO9HMaoKwJZ7Rf8AYPDDzKpZBqfvwQAIfkECQoAAAAsAAAAABAAEAAAAzMIumIlK8oyhpHsnFZfhYumCYUhDAQxRIdhHBGqRoKw0R8DYlJd8z0fMDgsGo/IpHI5TAAAIfkECQoAAAAsAAAAABAAEAAAAzIIunInK0rnZBTwGPNMgQwmdsNgXGJUlIWEuR5oWUIpz8pAEAMe6TwfwyYsGo/IpFKSAAAh+QQJCgAAACwAAAAAEAAQAAADMwi6IMKQORfjdOe82p4wGccc4CEuQradylesojEMBgsUc2G7sDX3lQGBMLAJibufbSlKAAAh+QQJCgAAACwAAAAAEAAQAAADMgi63P7wCRHZnFVdmgHu2nFwlWCI3WGc3TSWhUFGxTAUkGCbtgENBMJAEJsxgMLWzpEAACH5BAkKAAAALAAAAAAQABAAAAMyCLrc/jDKSatlQtScKdceCAjDII7HcQ4EMTCpyrCuUBjCYRgHVtqlAiB1YhiCnlsRkAAAOwAAAAAAAAAAAA==\"/><br/><br/><div class='top10'>  <p>Suggestions:</p>  <div class='top10'>    <ul class=\"list-group search_group\">      <li class=\"search_item list-group-item list-group-item-success\" ng-repeat=\"result in suggestions\">        <div class=\"row\">          <a ng-click=\"show_song(result)\"><img class='play_img' src='{{result.thumbnails.default.url}}' width='80'></a>	  <div class=\"play_img_img\"></div>          <div class='song_name'><a ng-click=\"show_song(result)\">{{result.title}}</a></div>        </div>      </li>    </ul>  </div></div><div ng-show=\"isAdmin() && show_admin\">	<div class='top10'>	  <p>Admin:</p>	</div>	<p>ID: {{song.id}}</p>	<p>Filename: {{song.filename}}</p>	<p>Burnt: {{song.burnt}}</p>	<a class=\"btn btn-primary btn-jukenet\" ng-click=\"delete_song(song)\">		Delete	</a>	<a class=\"btn btn-primary btn-jukenet\" ng-click=\"solve_problem(song)\">		Problem	</a>	<a class=\"btn btn-primary btn-jukenet\" ng-click=\"burn(song)\">		Burnt song	</a></div><br/><br/><br/><!--<p><audio controls preload=\"none\"><source src=\"{{song.storage_url2}}\" type=\"audio/mp3\">Your browser does not support the audio element.</audio></p><h2>{{artist.name}}</h2><div class=\"row\">  <div class=\"col-md-4\">    <img class=\"img-responsive\" src='{{artist.image_url}}' ng-show=\"artist.image_url.length > 0\">  </div></div>--><!-- Confirmation Dialog -->    <div class=\"modal\" modal=\"showModal\" ng-show=\"showModal\">      <div class=\"modal-dialog\">        <div class=\"modal-content\">          <div class=\"modal-header\">            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\" ng-click=\"close_modal()\">×</button>            <h4 class=\"modal-title\">Signaler cette chanson</h4>          </div>          <div class=\"modal-body\">            <p><a ng-click=\"report_it('not_song');\">Ce n'est pas une chanson</a></p>            <p><a ng-click=\"report_it('too_much_blank');\">Trop de blanc au debut ou à la fin</a></p>            <p><a ng-click=\"report_it('pas_assez_fort');\">Son pas assez fort</a></p>            <p><a ng-click=\"report_it('trop_fort');\">Son trop fort</a></p>            <p><a ng-click=\"report_it('bad_quality');\">Mauvaise qualité</a></p>          </div>        </div>      </div>    </div><!-- End of Confirmation Dialog -->";
var template_homepage = "<style>.requested {	background-color: blue;}</style><div class=\"navbar navbar-inverse navbar-fixed-top\">	<img class=\"\" src='//storage.googleapis.com/juke_imgs/JukeNet.png' width='80'>		<button type=\"button\" class=\"btn btn-default\" aria-label=\"Favorites\" ng-click=\"go_favorites()\">		<span class=\"fa fa-heart\" aria-hidden=\"true\" style=\"color:red\"></span>	</button>	<button type=\"button\" class=\"btn btn-default\" aria-label=\"List Places\" ng-click=\"list_locations()\">		<span class=\"fa fa-building\" aria-hidden=\"true\" style=\"color:blue\"></span>		<span ng-hide=\"editing || !got_a_loc\"><a ng-click=\"list_locations()\">{{location.name}}</a></span>	</button></div><br/><br/><br/><div class='here'  ng-show=\"(isAdmin() || isWaitress()) && mode == 'server'\">	<em class='fire'>Mode Waitress</em><br/>	<span ng-show=\"editingWaitress\">		<label>Écrit quelque chose qui apparaîtra à l'écran:</label><br/>		<input type=\"checkbox\" ng-model=\"isPublicMsg\"> Message public<br/>		<textarea ng-model=\"publicMsg\" name=\"publicMsg\" style=\"width:100%\" placeholder=\"2 pour 1 sur le fort\"></textarea><br/>		<button class=\"btn\" ng-click=\"saveWaitress()\">Save</button>		<br/>	</span>	<span ng-hide=\"editingWaitress\">		<a ng-click=\"editWaitress()\">Publie quelque chose</a>	</span></div><div class='here'  ng-show=\"isAdmin() && mode == 'server'\">	<p>Admin :</p>	<span ng-show=\"editing\">		<label>Name:</label>		<input type=\"text\" ng-model=\"location.name\" placeholder=\"Name\" ng-required/>		<button class=\"btn\" ng-click=\"saveName()\">Save</button>		<br/>	</span>	<a ng-click=\"setLocationGPS()\">Set GPS loc</a> - <a ng-click=\"editName()\">Edit name</a></div><div class='search' id='search_box'>	<p>Recherche:</p>    <form class=\"form\" role=\"search\">      <div class=\"input-group add-on\">        <input class=\"form-control ui-front input-lg\" placeholder=\"Recherche\" name=\"q\" id=\"srch-term\" type=\"text\" value=\"\" ng-model='keyword' autocorrect=\"off\" autocapitalize=\"off\" spellcheck=\"false\">        <div class=\"input-group-btn\">          <button class=\"btn btn-default\" ng-click=\"do_search()\"><i class=\"fa fa-search\"></i></button>        </div>      </div>    </form></div><br/><div class=\"alert alert-info\" role=\"alert\"  ng-show=\"favorites_length == 0\">  <span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=\"true\"></span>  <span class=\"sr-only\">Attention:</span>	<b>Tu es nouveau?</b> Vous n'avez aucun j'aime. En cliquant sur J'aime d'une chanson, vous vous assurez de la ré-entendre sans avoir à la redemander.</div><div ng-show=\"choose_location\">	<div class='here'>		<p>Dites-nous ou vous êtes?</p>		<div class='location_banner' ng-repeat=\"location2 in locations\">		  <a ng-click=\"chooseLocation(location2)\">{{location2.name}}</a>		</div>	</div></div><div ng-show=\"got_a_loc && mode == 'DJ'\">	<div class='here'>		<h1>Ton DJ</h1>	</div>	<div class=\"alert alert-info\" role=\"alert\">		<span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=\"true\"></span>		<span class=\"sr-only\">Attention:</span>		Envoie tes demandes speciales au DJ en passant par la recherche.	</div></div><div ng-show=\"got_a_loc && mode == 'Karaoke'\">	<div class='karaoke_dj'></div>	<div class=\"alert alert-info\" role=\"alert\">		<span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=\"true\"></span>		<span class=\"sr-only\">Attention:</span>		Envoie tes demandes de Karaoke au DJ en passant par la recherche.	</div></div><div ng-show=\"got_a_loc && mode == 'server'\"><!--	<div class='here' ng-show=\"location\">		<p>Vous êtes ici:</p>		<div class='location_banner'>		  <img src='{{location.banner_url}}' ng-show=\"location.banner_url.length > 0\">		  <div class='artist_name' ng-show=\"location.banner_url.length == 0 || location.banner_url == null\">							</div>		</div>	</div>-->	<div class='here' ng-show=\"location && mode == 'server'\">		<p>En ce moment:</p>    <div class=\"list-group search_group\">      <li class=\"search_item list-group-item list-group-item-success\">        <div class=\"row\">            <div class=\"song_thumb\">         	<a ng-click=\"show_song(playing)\"><img class=\"play_img\" src='{{playing.thumbnail.url}}' width='80'></a>		<div class=\"play_img_img\"></div>            </div><div class=\"\">          <div class='song_name'><a ng-click=\"show_song(playing)\">{{playing.title}}</a></div>          <div class='artist_name'>{{playing.artistName}}</div>					<div>						({{playing.skiped}}/{{need_to_skip}})<div class='in_song_box'>						<a class=\"btn btn-primary btn-sm pull-right btn-jukenet\" ng-click=\"master_skip()\" ng-show=\"isAdmin() || isWaitress()\">							<span class=\"fa fa-remove\" aria-hidden=\"true\"></span>Master skip						</a>						<a class=\"btn btn-primary btn-sm pull-right btn-jukenet\" ng-click=\"skip()\" ng-show=\"skip_enabled\">							<span class=\"fa fa-remove\" aria-hidden=\"true\"></span>Skip						</a></div>					</div></div>        </div>      </li>    </div>			<p>Tes prochaines tounes:</p>		<div class=\"list-group search_group\">      <li class=\"search_item list-group-item list-group-item-success\" ng-repeat=\"result in playlist\" ng-class=\"{'requested' : result.isRequest}\">        <div class=\"row\">            <div class=\"song_thumb\">         	<a ng-click=\"show_song(result)\"><img src='{{result.thumbnail.url}}' width='80'></a>		<div class=\"play_img_img\"></div>             </div><div class=\"\">	<div class='song_name'><a ng-click=\"show_song(result)\">{{result.title}}</a></div><!--          <div class='artist_name'><a ng-click=\"show_artist(result)\"></a></div>-->          <div class='artist_name'>{{result.artistName}}</div>          <img src='{{like.photoURL}}' width='30' ng-repeat=\"like in result.likes\"><div class=\"in_song_box\" ng-show=\"isAdmin() || isWaitress()\">						<a class=\"btn btn-primary btn-sm pull-right btn-jukenet\" ng-click=\"master_skip_playlist(result)\">							<span class=\"glyphicon glyphicon-step-forward\" aria-hidden=\"true\"></span>Master skip						</a></div></div>                  </div>      </li>    </div>	</div></div><div class=\"alert alert-info\" role=\"alert\" ng-hide=\"got_a_loc\">  <span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=\"true\"></span>  <span class=\"sr-only\">Attention:</span>	<b>JukeNet introuvable.</b> Branche-toi au WiFi et/ou active ton GPS. <a ng-click=\"list_locations()\">Ou bien trouve un bar par loin.</a>	<button type=\"button\" class=\"btn btn-default\" aria-label=\"List Places\" ng-click=\"list_locations()\">		<span class=\"fa fa-building\" aria-hidden=\"true\" style=\"color:blue\"></span>	</button></div><div class='top10' ng-show=\"concours.length > 0\">  <p><em class='fire'>Concours</em></p>    <ul class=\"list-group search_group\">      <li class=\"search_item list-group-item list-group-item-success\" ng-repeat=\"result in concours\">        <div class=\"row\">			<a ng-click=\"show_concours(result)\"><img class=\"play_img\" src='{{result.thumbnail}}' width='80'></a>         	<div class='artist_name'><a ng-click=\"show_concours(result)\"><u>{{result.name}}</u></a></div>        </div>      </li>    </ul></div><div class='top10'>  <p>JukeNet Top:</p>  <div class='top10' ng-show=\"top10.length > 0\">    <ul class=\"list-group search_group\">      <li class=\"search_item list-group-item list-group-item-success\" ng-repeat=\"result in top10\">        <div class=\"row\">            <div class=\"song_thumb\">         	<a ng-click=\"show_song(result)\"><img src='{{result.thumbnail.url}}' width='80'></a>		<div class=\"play_img_img\"></div>             </div><div class=\"\">	<div class='song_name'><a ng-click=\"show_song(result)\">{{result.title}}</a></div><!--          <div class='artist_name'><a ng-click=\"show_artist(result)\"></a></div>-->          <div class='artist_name'>{{result.artistName}}</div></div>                  </div>      </li>    </ul>  </div></div><div class=\"alert alert-info\" role=\"alert\">  <span class=\"glyphicon glyphicon-exclamation-sign\" aria-hidden=\"true\"></span>  <span class=\"sr-only\">Tu veux JukeNet chez toi?</span>	Tu veux JukeNet chez toi? Si tu veux précommander JukeNet <a ng-click=\"preorder()\"><img class=\"btn_order\"></a></div><div class='top10' ng-show=\"isAdmin() || isWaitress()\">  <p>Tu fais parti du staff !!</p>	<p>Sound effect :</p>	<a ng-click=\"soundEffect('https://storage.googleapis.com/sound_effect/Air%20Horn-SoundBible.com-964603082.mp3')\">Air Horn</a> -	<a ng-click=\"soundEffect('https://storage.googleapis.com/sound_effect/Jolly%20Laugh-SoundBible.com-874430997.mp3')\">Hoho</a> -	<a ng-click=\"soundEffect('https://storage.googleapis.com/sound_effect/Siren-SoundBible.com-1094437108.mp3')\">Siren</a> -	<a ng-click=\"soundEffect('https://storage.googleapis.com/sound_effect/Woop%20Woop-SoundBible.com-198943467.mp3')\">Woop Woop</a> -	<a ng-click=\"soundEffect('https://storage.googleapis.com/sound_effect/YeeHaw.mp3')\">Yee Haw</a></div><div ng-hide=\"got_a_loc\">  <div class='here'>    <p>1-833-JUKENET</p>  </div></div><div>	<p>{{user.uid}}</p>	<a ng-click=\"logoff()\">Deconnect</a></div>";


var app = angular
  .module('app', [
    'ui.router'
  ])
  .config(['$stateProvider', '$urlRouterProvider', '$sceDelegateProvider', function($stateProvider, $urlRouterProvider, $sceDelegateProvider) {

		$sceDelegateProvider.resourceUrlWhitelist([
  	  // Allow same origin resource loads.
  	  'self',
	    // Allow loading from our assets domain.  Notice the difference between * and **.
	    'https://storage.googleapis.com/**',
    	'http://storage.googleapis.com/**',
			'http://toutrix.com/**',
			'https://toutrix.com/**',
			'https://*.googleapis.com/**'
	  ]);

    $stateProvider

		.state('Concours', {url: '/Concours', template: template_Concours, controller: 'ConcoursController'}).state('Favorites', {url: '/Favorites', template: template_Favorites, controller: 'FavoritesController'}).state('Location', {url: '/Location', template: template_Location, controller: 'LocationController'}).state('Locations', {url: '/Locations', template: template_Locations, controller: 'LocationsController'}).state('Search', {url: '/Search', template: template_Search, controller: 'SearchController'}).state('ShowSong', {url: '/ShowSong', template: template_ShowSong, controller: 'ShowSongController'}).state('homepage', {url: '/homepage', template: template_homepage, controller: 'homepageController'});

    $urlRouterProvider.otherwise('homepage');
}]);

console.log("Gooing to initialise controllers");

angular.module('app').controller('ConcoursController', ['$scope', '$rootScope', '$state',  '$http', '$window', '$interval', '$timeout', '$stateParams', function($scope, $rootScope, $state, $http, $window, $interval, $timeout, $stateParams) { var scope = $scope;var firstLoad = true;
		$scope.playEnabled = true;
		var temps = 20000;
		$scope.participants = [];

		firebase.database().ref('concours_users/' + $rootScope.concour.id + "/" + $scope.user.uid).once('value', function (snapshot) {
			var c = snapshot.val();
			if (c == null) {
				$scope.points = 0;
				$scope.today_points = 0;
				$scope.last_day = get_today();
			} else {
				$scope.points = c.points;
				if (typeof c.today_points === "undefined")
					c.today_points = 0;
				if (typeof c.last_day === "undefined")
					c.last_day = get_today();
				$scope.today_points = c.today_points;
				$scope.last_day = c.last_day;
			}
			if ($scope.last_day != get_today()) {
				$scope.today_points = 0;
				$scope.last_day = get_today();
			}
			if ($scope.today_points >= $rootScope.concour.max_points_per_day)
				$scope.playEnabled = false;
			$scope.$apply(function() {});
		});

		firebase.database().ref('concours_users/' + $rootScope.concour.id).on('value', function (snapshot) {
			var p = snapshot.val();
			var participants = [];
			Object.keys(p).forEach(function(k) {
				p[k].userId = k;
				participants.push(p[k]);
				firebase.database().ref('users/' + k).on('value', function (snapshot) {
					var user2 = snapshot.val();
					if (typeof user2.publique !== "undefined" && typeof user2.publique.displayName !== "undefined" && user2.publique.displayName.length > 0) {
						p[k].name = user2.publique.displayName;
					} else if (typeof user2.email !== "undefined" && user2.email.indexOf("@") > -1) {
						p[k].name = user2.email.split("@")[0];
					} else {
						p[k].name = "";
					}
					if (typeof user2.publique !== "undefined" && typeof user2.publique.jn_photo !== "undefined" && user2.publique.jn_photo.length > 0) {
						p[k].thumbnail = user2.publique.jn_photo;
					} else if (typeof user2.publique !== "undefined" && typeof user2.publique.photoURL !== "undefined" && user2.publique.photoURL.length > 0) {
						p[k].thumbnail = user2.publique.photoURL;
					} else {
						p[k].thumbnail = "https://storage.googleapis.com/juke_imgs/no-face.png";
					}
					if (firstLoad)
						$scope.$apply(function() {});
				});
			});

			participants.sort(function (a, b) {
				if (a.points > b.points) return -1;
				if (a.points < b.points) return 1;
				return 0;
			});

			if ($rootScope.user.uid != "JV2XRBzBcLhq20m7gKryZm9WBED3") {
				var i = 0;
				participants.forEach( function (p) {
					if (i < 3) {
						p.points = "???";
					}
					i++;
				});
				var first = shuffle(participants.slice(0,3));
				var second = participants.slice(3);
				$scope.participants = first.concat(second);
			} else {
				$scope.participants = participants;
			}
			firstLoad = true;
		});

		$scope.play = function () {
			$scope.playEnabled = false;
			$scope.points++;
			$scope.today_points++;
			firstLoad = false;
			firebase.database().ref('concours_users/' + $rootScope.concour.id + "/" + $scope.user.uid).update({points: $scope.points, today_points: $scope.today_points, last_day: $scope.last_day});
			if(FacebookAds) {
				//FacebookAds.showInterstitial();
				FacebookAds.prepareInterstitial( {adId:adid.concours, autoShow:true} );
			}

			setTimeout( function () {
				$scope.playEnabled = true;
				temps = temps + 5000;
			}, temps);
		}}]);angular.module('app').controller('FavoritesController', ['$scope', '$rootScope', '$state',  '$http', '$window', '$interval', '$timeout', '$stateParams', function($scope, $rootScope, $state, $http, $window, $interval, $timeout, $stateParams) { var scope = $scope;$scope.likes = [];
		$scope.dislikes = [];
		$scope.dataLoading = true;

		var get_user_likes = function () {
			$http({
         method: 'GET',
         url: jukenet_url_backend + '/jukenet_svc/get_favorites?userId=' + $rootScope.user.uid
      }).then(function successCallback(response) {
				console.log("After get_favorites:");
				console.log(response);
				$scope.likes = response.data.likes;
				$scope.dislikes = response.data.dislikes;
				$scope.dataLoading = false;
				console.log($scope.likes);
      }, function errorCallback(response) {
				console.log("Serious problem....!!!");
      });
    }
  get_user_likes();

    $scope.show_song = function (song) {
      $rootScope.song = song;
      $state.go('ShowSong',{});
    }}]);angular.module('app').controller('LocationController', ['$scope', '$rootScope', '$state',  '$http', '$window', '$interval', '$timeout', '$stateParams', function($scope, $rootScope, $state, $http, $window, $interval, $timeout, $stateParams) { var scope = $scope;$scope.connected_users = [];
		$scope.selected = [];

		$scope.messages = [];

		function cmpAddedAt(a,b) {
			if (a.addedAt > b.addedAt)
				return -1;
			if (a.addedAt < b.addedAt)
				return 1;
			return 0;
		}

		function do_messages(messages) {
			if (typeof messages === "undefined" || messages == null) return;
			Object.keys(messages).forEach(function(k) {
				$rootScope.getUser(messages[k].userId, function (user) {
					messages[k].photoURL = user.publique.photoURL;
					messages[k].hour = millisecondsToStr(((Date.now() / 1000) - messages[k].addedAt)*1000);
					$scope.$apply( function () {
						$scope.messages.push(messages[k]);
						$scope.messages.sort(cmpAddedAt);
					});
				});
			});
		}

		var key2 = 'servers_posts/' + $rootScope.show_location.id;
		var msgRef = firebase.database().ref(key2);
		var intRef = null;
		msgRef.orderByKey().limitToLast(5).on('value', function(messages) {
			messages = messages.val();
			do_messages(messages);
		});

		$http({
  	  method: 'GET',
      url: jukenet_url_backend + '/jukenet_svc/get_connected?locationId=' + $rootScope.show_location.id
    }).then(function successCallback(response) {
	 		$scope.connected_users = response.data;
			console.log(response.data);
    }, function errorCallback(response) {
      console.log(response.data);
    });

		$scope.showUser = function (user) {
			$state.go('user',{user: user});
		}

		// Get stats for this location
		console.log("Show location:");
		console.log($rootScope.show_location);
		$scope.unique_connected = "n/d";
		$http({
  	  method: 'GET',
      url: jukenet_url_backend + '/jukenet_svc/unique_connected?locationId=' + $rootScope.show_location.id
    }).then(function successCallback(response) {
	 		$scope.unique_connected = response.data.connected;
    }, function errorCallback(response) {
      console.log(response.data);
    });

		// Get server logs
		$scope.logs = [];
		if ($rootScope.isAdmin())
			firebase.database().ref('server_logs/' + $rootScope.show_location.id).orderByKey().limitToLast(10).once('value').then( function (logs) {
				logs = logs.val();
				if (logs == null) return;
				$scope.logs = logs;
			});

		// Get play categories
		firebase.database().ref('servers/' + $rootScope.show_location.id + "/categories").once('value').then( function (cats) {
			cats = cats.val();
			if (cats == null) return;
			$scope.dont_play = cats.dont_play;
			cats = cats.categories;
			$scope.selected = []
			if (cats !== null)
				cats.forEach(function(cat) {
					$scope.$apply(function() {
						$scope.selected.push(cat);
					});
				});
		});

		$scope.wipe_mp3 = function () {
			var key2 = 'events/' + $rootScope.show_location.id;
			firebase.database().ref(key2).push().set({message:"wipe_mp3"});
			console.log("Wipe event sended");
		}

		$scope.remove_public = function () {
			firebase.database().ref('servers/' + $rootScope.show_location.id).update({public:false});
		}

		$scope.save_category = function () {
			console.log("Saving category for that place");
			console.log($scope.selected);
			var data = {categories:$scope.selected};
			if ($scope.dont_play)
				data.dont_play = $scope.dont_play;
			firebase.database().ref('servers/' + $rootScope.show_location.id + "/categories").set(data);
			alert("Categories saved");
			//console.log(data);
		}

		$scope.toggle = function (item, list) {
			var idx = list.indexOf(item);
			if (idx > -1) {
				list.splice(idx, 1);
			} else {
				list.push(item);
			}
		};

		$scope.exists = function (item, list) {
			return list.indexOf(item) > -1;
		};}]);angular.module('app').controller('LocationsController', ['$scope', '$rootScope', '$state',  '$http', '$window', '$interval', '$timeout', '$stateParams', function($scope, $rootScope, $state, $http, $window, $interval, $timeout, $stateParams) { var scope = $scope;var th_url = "/jukenet_svc/list_locations";
		if (global_pos)
			th_url += "?lat=" + global_pos.latitude + "&long=" + global_pos.longitude;

		$http({
        method: 'GET',
        url: jukenet_url_backend + th_url
		}).then(function successCallback(response) {
			console.log("After get_location");
			console.log(response);
			$scope.locations = response.data;
    }, function errorCallback(response) {
			console.log("Serious problem....!!!");
    });

		$scope.location_class = function (location ) {
			if (location.mode == "server" || location.mode == "DJ") return "jukenet_dj";
			if (!location.enabled) return 'server_disabled';
			return 'info';
}

$scope.location_color = function (location ) {
			if (typeof location.mode !== "undefined" && location.mode == "place") return "green";
			if (!location.enabled) return "red";
			return 'green';
}

$scope.location_class = function (location) {
			if (typeof location.mode === "undefined") return "jukenet_dj";
			if (location.mode == "server" || location.mode == "DJ") return "jukenet_dj";
			return "glyphicon glyphicon-globe";
}

$scope.showLocation = function (location) {
			$rootScope.show_location = location;
	    $state.go('Location',{});
}}]);angular.module('app').controller('SearchController', ['$scope', '$rootScope', '$state',  '$http', '$window', '$interval', '$timeout', '$stateParams', function($scope, $rootScope, $state, $http, $window, $interval, $timeout, $stateParams) { var scope = $scope;ext_homepage_scope = $scope;
$scope.keyword2 = $rootScope.keyword;
$scope.dataLoading = false;

$scope.show_song = function (song) {
      $rootScope.song = song;
      $state.go('ShowSong',{});
}

$scope.do_search = function() {
  $rootScope.keyword = $scope.keyword2;
  $scope.dataLoading = true;
  $scope.no_result_show = 0;
  document.activeElement.blur();
  $http({
        method: 'GET',
        url: jukenet_url_backend + '/jukenet_svc/search?userId=' + $rootScope.user.uid + '&q=' + $scope.keyword2
  }).then(function successCallback(response) {
				$scope.dataLoading = false;
				$scope.results = response.data;
        $scope.results.forEach( function (entry) {
          if (typeof entry.image_url === "undefined" || entry.image_url.length == 0)
            entry.image_url = "//storage.googleapis.com/juke_imgs/no_disc.jpg";
  });
  if ($scope.results.length == 0)
      		$scope.no_result_show = 1;        
  }, function errorCallback(response) {
				$scope.dataLoading = false;
        console.log(response.data);
  });
}

$scope.do_search();}]);angular.module('app').controller('ShowSongController', ['$scope', '$rootScope', '$state',  '$http', '$window', '$interval', '$timeout', '$stateParams', function($scope, $rootScope, $state, $http, $window, $interval, $timeout, $stateParams) { var scope = $scope;$scope.showModal = false;
		$scope.like_button = "J'aime";
    $scope.song = $rootScope.song;

		if ($rootScope.isAdmin() && typeof $rootScope.song.id !== "undefined") {
			$rootScope.getSong($rootScope.song.id, function (song) {
				if (song != null && !song.error) {
					console.log("Reloaded Song: ", song);
					$scope.song = song;
					loadArtist();
				}
			}, true);
		}

		function loadArtist() {
			console.log("Loading artist");
			if (typeof $scope.song.artistId !== "undefined" && $scope.song.artistId != null) {
				console.log("Loading artist -- 2");
				firebase.database().ref('artists/' + $scope.song.artistId).once('value', function (art) {
					art = art.val();
					$scope.artist = {name: art.name, albums: []};
					loadAlbum(art);
					console.log($scope.artist);
				});
			}
		}
		loadArtist();
		function loadAlbum(art) {
			if (typeof art.albums !== "undefined")
				Object.keys(art.albums).forEach( function (k) {
					var al = art.albums[k];
					al.id = k;
					$scope.artist.albums.push(al);
				});
		}

		$scope.saveTitle = function () {
			firebase.database().ref('songs/' + $scope.song.id).update({title: $scope.song.title});
		}

		$scope.show_categories = false;
		$scope.all_categories = [];
		$rootScope.categories.forEach( function (cat) {
			$scope.all_categories.push(cat.category);
		});

		$scope.changeArtist = function () {
			console.log($scope.song.artistId);
			firebase.database().ref('songs/' + $scope.song.id).update({artistId: $scope.song.artistId});
			loadArtist();
		}

		$scope.changeAlbum = function () {
			console.log($scope.song.albumId);
			firebase.database().ref('songs/' + $scope.song.id).update({albumId: $scope.song.albumId});
		}

		$scope.addArtist = function () {			
			var artistId = firebase.database().ref('artists').push().key;
			firebase.database().ref('artists/' + artistId).set({name: $scope.song.artist_name});
			$scope.song.artistId = artistId;
			firebase.database().ref('songs/' + $scope.song.id).update({artistId: artistId});
		}

		$scope.addAlbum = function () {
			if (typeof $scope.song.artistId === "undefined" || $scope.song.artistId == null) {
				alert("Oops");
				return;
			}
			var new_key = 'artists/' + $scope.song.artistId + "/albums";
			var albumId = firebase.database().ref(new_key).push().key;
			$scope.song.albumId = albumId;
			firebase.database().ref('artists/' + $scope.song.artistId + "/albums/" + albumId).set({name: $scope.song.album_name});
			firebase.database().ref('songs/' + $scope.song.id).update({albumId: albumId});
			loadArtist();
		}

		$scope.suggestions = []
		$scope.show_error = false;
		$scope.show_admin = true;
		if (typeof $scope.song.id === "undefined")
			$scope.show_admin = false;
		$scope.error = {message:""}
		$scope.dataLoading = true;
		var user_like = null;
    var requested = false;

		$scope.openCat = function () {
			$scope.show_categories = true;
		}

		$scope.addCat = function (cat) {
			console.log("Adding category: " + cat);
			if (typeof $scope.song.wiki_categories === "undefined")
				$scope.song.wiki_categories = [];
			$scope.song.wiki_categories.push(cat);
			$scope.show_categories = false;
			//console.log($scope.song.wiki_categories);
			firebase.database().ref('songs/' + $scope.song.id).update({wiki_categories: $scope.song.wiki_categories});
		}

/*
		var player;
	  player = new YT.Player('video1', {
		  height: '360',
		  width: '640',
		   videoId: $scope.song.yid,
		   events: {
				'onReady': onPlayerReady,
				'onStateChange': onPlayerStateChange
			}
		});
*/

		$scope.remove_cat = function (cat) {
			console.log("Remove categorie: " + cat);
			var idx = $scope.song.wiki_categories.indexOf(cat);
			console.log(idx + " index");
			$scope.song.wiki_categories.splice(idx, 1);
			//console.log($scope.song.wiki_categories);
			firebase.database().ref('songs/' + $scope.song.id).update({wiki_categories: $scope.song.wiki_categories});
		}

		$scope.getAudioUrl = function () {
			return "https://storage.googleapis.com/jukenet_mp3/" + $scope.song.filename;
		}

		function onPlayerReady(event) {
	    event.target.playVideo();
		}

		function onPlayerStateChange(event) {
			console.log("Player state: " + event.data);
			if (event.data == 0) { // Stopped
				// We should load
			}
		}

		$scope.report = function () {
			console.log("Show report modal");
			$scope.showModal = true;
		}
		$scope.close_modal = function () {
			$scope.showModal = false;
		}
		$scope.save_song = function (song) {
		}
		$scope.delete_song = function (song) {
			var new_state =  {state: "deleted", deleted: 1}
			firebase.database().ref('songs/' + song.id).update(new_state);
			alert("Thank you");
		}

		$scope.burn = function (song) {
			var new_state =  {burnt: true}
			firebase.database().ref('songs/' + song.id).update(new_state);
			alert("Thank you");
		}

		$scope.dislike_enabled = function () {
			if (!$rootScope.user) return true;
			if (user_like == null) return false;
			if (user_like.like == -1)
				return true;
			return false;
		}

		$scope.like_enabled = function () {
			if (!$rootScope.user) return true;
			if (user_like == null) return false;
			if (user_like.like == -1)	return false;
			//if (typeof user_like.like_less === "undefined") return false;
			return true;
		}
	
		var get_user_like = function () {
			if (typeof $scope.song === "undefined" || typeof $scope.song.yid === "undefined") {user_like = null; console.log("Error???");return;}
			user_like = $rootScope.getFavorite($scope.song.id);
			$scope.dataLoading = false;
		}
		get_user_like();

    $scope.ask_enabled = function () {
			if (!$rootScope.user) return true;
      if (requested) return true;
      return false;
    }

    if (typeof $scope.song === "undefined") {
      $state.go('homepage',{});
      return;
    }

    $scope.do_we_have_a_loc = function () {
			var got_a = $rootScope.got_a_loc;
      return got_a;
    }

		$scope.dislike = function () {
			user_like = {like: -1}
			firebase.database().ref('users_likes/' + $rootScope.user.uid + '/' + $scope.song.id).set(user_like);

			if ($scope.song.id == $rootScope.playing.id)
				$rootScope.skip_song($rootScope.playing.id);
		}

		$scope.like = function () {
			user_like = {like: 1}
			firebase.database().ref('users_likes/' + $rootScope.user.uid + '/' + $scope.song.id).set(user_like, function(error) {
				if (error) {
					$rootScope.send_error("Can't save user like: users_likes/" + $rootScope.user.uid + '/' + $scope.song.id);
				}
			});
		}

		$scope.request = function () {
    	if (requested) return;
			$scope.show_error = false;
			requested = true;
			var song = $scope.song;

			$http({
				method: 'GET',
				url: jukenet_url_backend + '/jukenet_svc/request_song?userId=' + $rootScope.user.uid + "&serverId=" + $rootScope.location.id + "&yid=" + $scope.song.yid
			}).then(function successCallback(response) {
				console.log("request_song response:");
				console.log(response);
				if (response.data.success) {
					song.asked = true;
					//$state.go('thankyou',{});
					if (FacebookAds) {
						FacebookAds.showInterstitial();
						FacebookAds.prepareInterstitial( {adId:adid.interstitial, autoShow:false} );
					}
				} else {
					$scope.error.message = response.data.message;
					$scope.show_error = true;
					requested = false;
				}
      }, function errorCallback(response) {
				$rootScope.send_error("Can't add request. Yid: " + $scope.song.yid);
				alert("Something goes wrong");
			});
    }

    function getRelated() {
			var url = jukenet_url_backend + "/get_youtube/related?id=" + $scope.song.yid;
			$http({
         method: 'GET',
         url: url
      }).then(function successCallback(response) {
				$scope.suggestions = response.data;
				$scope.suggestions.forEach( function (sug) {
					if (sug.title.length > 55) {
						sug.title = sug.title.substring(0,52) + "...";
					}
				});
      }, function errorCallback(response) {
        alert("Something goes wrong with related");
      });
    }
		getRelated();

		$scope.show_song = function (song) {
			$scope.dataLoading = true;
			$scope.error.message = "";
			$scope.like_button = "J'aime";
			$scope.show_error = false;
			song.thumbnail = {url: song.thumbnails.default.url}
			song.yid = song.id;
			$scope.song = song;
			$window.scrollTo(0, 0);
			loadArtist();
			//player.loadVideoById(song.yid);
			get_user_like();
			getRelated();
		}

		$scope.solve_problem = function (song) {
			var url = jukenet_url_backend + "/jukenet_svc/problem?id=" + $scope.song.id;
			$http({
         method: 'GET',
         url: url
      }).then(function successCallback(response) {
      }, function errorCallback(response) {
      });
		}}]);angular.module('app').controller('homepageController', ['$scope', '$rootScope', '$state',  '$http', '$window', '$interval', '$timeout', '$stateParams', function($scope, $rootScope, $state, $http, $window, $interval, $timeout, $stateParams) { var scope = $scope;$scope.editing = false;
$scope.editingWaitress = false;
$scope.isPublicMsg = true;
$timeout(function() {}, 1000);

$scope.list_locations = function () {
	$state.go('Locations',{});
}

		$scope.preorder = function () {
			$state.go('Preorder',{});
		}

		$scope.skip = function () {
			$rootScope.skip_song($rootScope.playing.id);
		}

    $scope.do_search = function(keyword) {
			if (typeof keyword !== "undefined")
				$scope.keyword = keyword;
			$rootScope.keyword = $scope.keyword;
			$state.go('Search');
    }

		$scope.editName = function () {
			$scope.editing = true;
		}

		$scope.editWaitress = function () {
			$scope.editingWaitress = true;
			firebase.database().ref('public_msg/' + $rootScope.location.id).once('value').then( function (msg) {
				$scope.$apply(function() {
					$scope.publicMsg = msg.val().msg;
				});
			});
		}

		$scope.soundEffect = function (url) {
			var key2 = 'events/' + $rootScope.location.id;
			firebase.database().ref(key2).push().set({message:"play_effect",url: url});

			$http({
		      method: 'GET',
		      url: jukenet_url_backend + "/jukenet_svc/remote/sound?serverId=" + $rootScope.location.id + "&url=" + encodeURI(url)
		    }).then(function successCallback(response) {
		    }, function errorCallback(response) {
		    });
		}

		$scope.saveWaitress = function () {
			console.log("Saving waitress msg");
			$scope.editingWaitress = false;
			firebase.database().ref('servers_posts/' + $rootScope.location.id).push().set({public: $scope.isPublicMsg, userId: $scope.user.uid, msg:$scope.publicMsg, addedAt: Math.floor(Date.now() / 1000)});
			firebase.database().ref('public_msg/' + $rootScope.location.id).update({public: $scope.isPublicMsg, userId: $scope.user.uid, msg:$scope.publicMsg, addedAt: Math.floor(Date.now() / 1000)});
		}

		$scope.saveName = function () {
			$http({
		      method: 'GET',
		      url: jukenet_url_backend + "/jukenet_svc/set_name?serverId=" + $rootScope.location.id + "&name=" + $scope.location.name
		    }).then(function successCallback(response) {
					$scope.editing = false;
		      alert("Thank you");
		    }, function errorCallback(response) {
		      console.log(response.data);
					alert("Something goes wrong...");
		    });
		}

		$scope.setLocationGPS = function () {
			if (global_pos == null) {
				alert('Sorry');
				return;
			}
			$http({
		      method: 'GET',
		      url: jukenet_url_backend + '/jukenet_svc/set_gps_loc?userId=' + $scope.user.uid + "&serverId=" + $rootScope.location.id + "&lat=" + global_pos.latitude + "&long=" + global_pos.longitude
		    }).then(function successCallback(response) {
		      alert("Thank you");
		    }, function errorCallback(response) {
		      console.log(response.data);
		    });
		}

    $scope.go_favorites = function () {
      $state.go('Favorites',{});
    }

		$scope.isSkipVisible = function () {
			console.log("isSkipVisible: " + $rootScope.skip_enabled);
			return $rootScope.skip_enabled;
		}}]);

app.run(function ($http, $rootScope, $location, $state, $window, $interval, $timeout) {
	console.log("Loading angular app");
	$rootScope.error = {message:"", show_error: false}
	if (0 == 1) {
		$rootScope.isLogged = false;
	} else {
		$rootScope.isLogged = true;
		if (typeof $rootScope.onAppReady !== "undefined")
			$rootScope.onAppReady();
	}
	firebase.auth().onAuthStateChanged(function(user) {
		//return $state.go('auth');
		console.log("Actual user:");
		console.log(user);
		$rootScope.user = user;
		if (0 == 1) {
			if ($rootScope.user == null && typeof facebookConnectPlugin !== "undefined") {
				return $state.go('auth');
			} else if ($rootScope.user == null) {
				return $state.go('auth');
			}
			$rootScope.isLogged = true;
			if (typeof $rootScope.onLogin !== "undefined")
				$rootScope.onLogin();
		}
		if (typeof $rootScope.onConnect !== "undefined")
			$rootScope.onConnect();
		if (typeof $rootScope.onAppReady !== "undefined")
			$rootScope.onAppReady();
	});

	$rootScope.googleSignin = function () {
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider).then(function(result) {
			// This gives you a Google Access Token. You can use it to access the Google API.
			var token = result.credential.accessToken;
			// The signed-in user info.
			var user = result.user;
			console.log("Signin user",user);
			if (typeof $rootScope.onLogin !== "undefined")
				$rootScope.onLogin();
		}).catch(function(error) {
			// Handle Errors here.
			var errorCode = error.code;
			var errorMessage = error.message;
			// The email of the user's account used.
			var email = error.email;
			var credential = error.credential;
			console.log(error);
			// ...
		});
	}

	$rootScope.signin = function (email, password) {
		firebase.auth().signInWithEmailAndPassword(email, password).then(function() {
			console.log("Signin successfully");
			$rootScope.show_error = false;
		}).catch(function(error) {
			var errorCode = error.code;
			var errorMessage = error.message;
			//console.log(error);
			$rootScope.error.show = true;
			$rootScope.error.message = error.message
		});
	}

	$rootScope.signup = function (email, password) {
		firebase.auth().createUserWithEmailAndPassword(email, password).then(function() {
			console.log("Signup successfully");
			$rootScope.show_error = false;
			if (typeof $rootScope.onSignup !== "undefined")
				$rootScope.onSignup();
		}).catch(function(error) {
			$rootScope.error.show = true;
			$rootScope.error.message = error.message
		});
	}

	var fbLoginSuccess = function (userData) {
		console.log("UserInfo: " + JSON.stringify(userData));
		facebookUserId = userData.authResponse.userID;
		var credential = firebase.auth.FacebookAuthProvider.credential(userData.authResponse.accessToken);
		firebase.auth().signInWithCredential(credential).then(function(result) {
			console.log("Signed with credential");
			console.log(result);
			$rootScope.user = result;
			$state.go('homepage',{});
			if (typeof $rootScope.afterConnect == "function")
				$rootScope.afterConnect();
		}).catch(function(error) {
			alert(error);
			console.log(error);
		});
	}

	$rootScope.login_with_facebook = function () {
		if (!facebookConnectPlugin) return err(null);
		facebookConnectPlugin.login(["email", "public_profile", "user_birthday", "user_friends"],
			fbLoginSuccess,
			function (error) {
				console.log("Error:",error);
				return err(error);
			}
		);
  }

var ad_units = {
	android : {
		banner:"1600570720267450_1934299506894568",
		interstitial:"1600570720267450_1934670196857499",
		concours: "1600570720267450_2020543961603455"
	},
	ios : {
		banner:"1600570720267450_1934669723524213",
		interstitial:"1600570720267450_1934669870190865",
		concours:"1600570720267450_2020543571603494"
	}
};

var adid = (/(android)/i.test(navigator.userAgent)) ? ad_units.android : ad_units.ios;
var is_iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;


	$rootScope.got_a_loc = false;
	$rootScope.connected = 10; // Nbr connected with him
	$rootScope.need_to_skip = 5;
	$rootScope.skip_enabled = true;
	$rootScope.gps_loc = {latitude: 0, longitude: 0}
	$rootScope.deviceType = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "iPad" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "iPhone" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";
	$rootScope.devicePlatform = (navigator.userAgent.match(/iPad/i))  == "iPad" ? "IOS" : (navigator.userAgent.match(/iPhone/i))  == "iPhone" ? "IOS" : (navigator.userAgent.match(/Android/i)) == "Android" ? "Android" : (navigator.userAgent.match(/BlackBerry/i)) == "BlackBerry" ? "BlackBerry" : "null";
	console.log($rootScope.devicePlatform);

	var facebookUserId;

  if (typeof StatusBar !== "undefined") {
	StatusBar.hide();
	setInterval(function() { StatusBar.hide(); }, 5000);
  }

	if(typeof FacebookAds !== "undefined") FacebookAds.prepareInterstitial( {adId:adid.interstitial, autoShow:false} );
			init_geo();
			if(typeof FacebookAds !== "undefined") FacebookAds.createBanner( {
				adId: adid.banner, 
				position:FacebookAds.AD_POSITION.BOTTOM_CENTER, 
				autoShow:true} );

  $rootScope.retour = function () {
		$window.history.back();
	}

	$rootScope.send_error = function (msg, err) {
		var data = {msg: msg}
		if (typeof err !== "undefined")
			data.err = err;
		if (typeof $rootScope.user !== "undefined" && $rootScope.user !== null)
			data.userId = $rootScope.user.uid;
		firebase.database().ref('error_logs').push().set(data);
	}

	$rootScope.isAdmin = function () {
		if (typeof $rootScope.user_groups === "undefined") return false;
		if ($rootScope.user_groups.indexOf('admin') > -1) return true;
		return false;
	}

	$rootScope.isWaitress = function () {
		if (typeof $rootScope.user_groups === "undefined") return false;
		if ($rootScope.user_groups.indexOf('waitress') > -1) return true;
		return false;
	}

  var get_connected = function() {
    $http({
  	  method: 'GET',
      url: jukenet_url_backend + '/jukenet_svc/connected?locationId=' + $rootScope.location.id
    }).then(function successCallback(response) {
	 		$rootScope.connected = response.data.connected;
			if ($rootScope.connected < 3) {
				$rootScope.need_to_skip = $rootScope.connected;
			} else {
				$rootScope.need_to_skip = Math.round($rootScope.connected/3) + 1;
			}
			if ($rootScope.need_to_skip==0)
				$rootScope.need_to_skip = 1;
    }, function errorCallback(response) {
      console.log(response.data);
    });
  }

  var get_categories = function() {
    $http({
  	  method: 'GET',
      url: jukenet_url_backend + '/jukenet_svc/get_categories'
    }).then(function successCallback(response) {
	 		$rootScope.categories = response.data;
			//console.log("Categories:");
			//console.log($rootScope.categories);
    }, function errorCallback(response) {
      console.log(response.data);
    });
  }
	get_categories();

	$rootScope.artists = null;
  var get_artists = function() {
		function compare(a,b) {
			if (a.name < b.name)
			  return -1;
			if (a.name > b.name)
			  return 1;
			return 0;
		}

		var artistsRef = firebase.database().ref('artists');
		artistsRef.on('value', function(artists) {
			artists = artists.val();
			//$rootScope.artists = artists.val();
			$rootScope.artists = [];
			Object.keys(artists).forEach(function (k) {
				var ar = artists[k];
				ar.id = k;
				$rootScope.artists.push(ar);
			});
			$rootScope.artists.sort(compare);
		});
  }
	get_artists();

	$rootScope.do_we_got_a_loc = function () {
		return $rootScope.got_a_loc;
	}

  $rootScope.getSong = function(songId, cb, no_cache) {
		if (typeof no_cache === "undefined") no_cache = false;
		var add_to_url = "";
		if (no_cache)
			add_to_url += "&no_cache=1";
		$http({
  		method: 'GET',
    	url: jukenet_url_backend + '/jukenet_svc/get_song?id=' + songId + add_to_url
    }).then(function successCallback(response) {
			if (typeof response.data.artistId !== "undefined") {
				$rootScope.getArtist(response.data.artistId, function (artist) {
					response.data.artistName = artist.name;
				});
		 		return cb(response.data);
			} else {
		 		return cb(response.data);
			}
    }, function errorCallback(response) {
      console.log(response.data);
    });
  }

  $rootScope.getArtist = function(artistId, cb, no_cache) {
		if (typeof no_cache === "undefined") no_cache = false;
		var add_to_url = "";
		if (no_cache)
			add_to_url += "&no_cache=1";
		$http({
  		method: 'GET',
    	url: jukenet_url_backend + '/jukenet_svc/get_artist?id=' + artistId + add_to_url
    }).then(function successCallback(response) {
	 		return cb(response.data);
    }, function errorCallback(response) {
      console.log(response.data);
    });
  }

	$rootScope.loginFb = function(err) {
		if (!facebookConnectPlugin) return err(null);
		facebookConnectPlugin.login(["email", "public_profile", "user_birthday", "user_friends"],
			fbLoginSuccess,
			function (error) {
				console.log(error);
				return err(error);
			}
		);
	}

  $rootScope.show_song = function (song) {
		$rootScope.song = song;
		$state.go('ShowSong',{});
	}

	$rootScope.top10 = null;
	var top10Ref = firebase.database().ref('top_jukenet/top_10');
	top10Ref.on('value', function(the_top) {
		$rootScope.top10 = the_top.val();
		console.log("TOP 10--------------__");
		console.log($rootScope.top10);
		$rootScope.top10.forEach( function (song) {
			if (typeof song.artistId !== "undefined") {
				$rootScope.getArtist(song.artistId, function (artist) {
					song.artistName = artist.name;
				});
			}
		});
	});

	$rootScope.show_concours = function (concour) {
		console.log("Show concours");
		$rootScope.concour = concour;
		$state.go('Concours',{});
	}

	$rootScope.favorites = null;
	function get_favorites(user_id) {
		var favorites = firebase.database().ref('users_likes/' + user_id);
		favorites.on('value', function(songs) {
			$rootScope.favorites = songs.val();
			$rootScope.favorites_length = Object.keys($rootScope.favorites).length;
		});
	}

	$rootScope.getFavorite = function(songId) {
		var found;
		if ($rootScope.favorites == null) return null;
		console.log("Our favorite:");
		console.log($rootScope.favorites);
		Object.keys($rootScope.favorites).forEach(function(k) {
			if (k == songId) found = $rootScope.favorites[k];
		});
		return found;
	}

	$rootScope.getSongIcon = function (songId) {
		var found;
		if ($rootScope.favorites == null) return "";
		console.log("Our favorite:");
		console.log($rootScope.favorites);
		Object.keys($rootScope.favorites).forEach(function(k) {
			if (k == songId) found = $rootScope.favorites[k];
		});
		var out = "invisible";
		if (found.like == 1) out = "like";
		if (found.like == -1) out = "block";
		return out;
	} 

	$rootScope.afterConnect = function () {
		if ($rootScope.user !== null) {
			var key = "users/" + $rootScope.user.uid;
			// Get back the user, because we have goups
			firebase.database().ref(key).once('value', function (the_user) {
				the_user = the_user.val();
				if (typeof $rootScope.user.providerData !== "undefined" && typeof $rootScope.user.providerData[0] !== "undefined") {
					//console.log($rootScope.user.providerData[0]);
					//console.log("Updating photo URL:", $rootScope.user.providerData[0].photoURL);
					firebase.database().ref("users/" + $rootScope.user.uid + "/publique").update({photoURL:$rootScope.user.providerData[0].photoURL});
					firebase.database().ref("users/" + $rootScope.user.uid).update({need_relogin:false});
				}

				$rootScope.user.groups = [];
				if (typeof the_user.groupes !== "undefined") {
					$rootScope.user.groups = the_user.groupes;
					//console.log("Groups:");
					//console.log(the_user.groupes);
				}
			});
		}
	}

	$rootScope.getUser = function (uid, cb) {
		var key = "users/" + uid;
		firebase.database().ref(key).once('value', function (the_user) {
			the_user = the_user.val();
			return cb(the_user);
		});
	}

	$rootScope.onConnect = function () {
		var key = "users/" + $rootScope.user.uid;
		firebase.database().ref(key).once('value', function (the_user) {
			the_user = the_user.val();
			$rootScope.user_groups = [];
			if (typeof the_user.groupes !== "undefined") {
				$rootScope.user.groups = the_user.groupes;
				//console.log("Groups:");
				//console.log(the_user.groupes);
				Object.keys(the_user.groupes).forEach( function (key) {
					$rootScope.user_groups.push(key);
				});
				//console.log($rootScope.user_groups);
			}

			console.log("Firebase user:");
			console.log(the_user);
			if (typeof the_user.need_relogin !== "undefined" && the_user.need_relogin) {
				// Server asked for a relogin
				//if ($rootScope.user.uid == "JV2XRBzBcLhq20m7gKryZm9WBED3")
					return $state.go('Auth');
			}
		});
		get_favorites($rootScope.user.uid);
	}

	$rootScope.master_skip = function () {
		var key2 = 'events/' + $rootScope.location.id;
		firebase.database().ref(key2).push().set({message:"skip"});

		$http({
			method: 'GET',
			url: jukenet_url_backend + '/jukenet_svc/skip?userId=' + $rootScope.user.uid + '&songId=' + $rootScope.playing.id + '&serverId=' + $rootScope.location.id
		}).then(function successCallback(response) {
		}, function errorCallback(response) {
		});
	}

	$rootScope.master_skip_playlist = function (request) {
		$http({
			method: 'GET',
			url: jukenet_url_backend + '/jukenet_svc/skip?userId=' + $rootScope.user.uid + '&songId=' + request.id + '&serverId=' + $rootScope.location.id
		}).then(function successCallback(response) {
		}, function errorCallback(response) {
		});
	}

	// TODO - Enregistrer le dernier skip pour etre sur quil ne puisse le faire 2-3 fois sur la meme chanson
  $rootScope.skip_song = function(songId) {
		if (!$rootScope.skip_enabled) return;
		$rootScope.skip_enabled = false;
		$timeout(function() {}, 10);
		// We are skiping the playing song?
		if (songId == $rootScope.playing.id) {
			var key = 'playing/' + $rootScope.location.id;
			firebase.database().ref(key).transaction(function(play) {
				if (typeof play.skiped === "undefined")
					play.skiped = 0;
				play.skiped++;

				if (play.skiped >= $rootScope.need_to_skip) {
					var key2 = 'events/' + $rootScope.location.id;
					firebase.database().ref(key2).push().set({message:"skip"});

					$http({
						method: 'GET',
						url: jukenet_url_backend + '/jukenet_svc/skip?userId=' + $rootScope.user.uid + '&songId=' + songId + '&serverId=' + $rootScope.location.id
					}).then(function successCallback(response) {
					}, function errorCallback(response) {
					});
				}
				return play;
			});
		} else {
			// Ok c'est probablement dans la playlist
			
		}
  }

	$rootScope.choose_location = false;
	$rootScope.getLocation = function() {
		console.log("getLocation started");
		if (global_pos != null) {
			var url = jukenet_url_backend + "/jukenet_svc/get_location?lat=" + global_pos.latitude + "&long=" + global_pos.longitude;
		} else {
			var url = jukenet_url_backend + "/jukenet_svc/get_location";
		}
		$http({
			method : "GET",
			url : url
		}).then(function mySuccess(response) {
			$rootScope.locations = response.data;
console.log("Locations", $rootScope.locations);
			if (response.data.length > 1) {
console.log("Asking for his location");
				$rootScope.choose_location = true;
			} else if (response.data.length == 1) {
				$rootScope.choose_location = false;
	      $rootScope.location = response.data[0];
				change_location($rootScope.location);
				if ($rootScope.got_a_loc)
					get_connected();
			} else {
				$rootScope.choose_location = false;
				$rootScope.got_a_loc = false;
				off_location();
			}
			console.log("Current location:");
    }, function myError(response) {
    });
  }
  $rootScope.getLocation();
	$interval($rootScope.getLocation, 60000);

	$rootScope.chooseLocation = function (server) {
		console.log("Server choosed:", server);
    $rootScope.location = server;
		if (typeof $rootScope.placeId === "undefined") {
			change_location(server);
			ping();
			if ($rootScope.got_a_loc)
				get_connected();
		} else {
			// This is a place, not a server or DJ
		}
	}

	// Check if global pos has changed
	$interval( function () {
		if (global_pos != null && !$rootScope.got_a_loc) {
			if ($rootScope.gps_loc.latitude != global_pos.latitude || $rootScope.gps_loc.longitude != global_pos.longitude) {
				$rootScope.gps_loc.latitude = global_pos.latitude;
				$rootScope.gps_loc.longitude = global_pos.longitude;
				$rootScope.getLocation();
			}
		}		
	}, 1000);

	var playlistRef, playingRef = null;
	var old_location = {id: null};
	function off_location() {
		if (playingRef != null)
			playingRef.off("value");
		if (playlistRef != null)
			playlistRef.off("value");
	}

	function change_location(location) {
		if (typeof location === "undefined" && typeof location.id !== "undefined") return;
		console.log("New location:", location);
		if (old_location.id == location.id) return;
		old_location = location;
		if (playingRef != null)
			playingRef.off("value");
		if (playlistRef != null)
			playlistRef.off("value");

		$rootScope.got_a_loc = true;
		$rootScope.mode = "server";
		if (typeof location.mode !== "undefined")
			$rootScope.mode = location.mode;
		console.log("Server mode: ", $rootScope.mode);

		var key = 'playing/' + location.id;
		playingRef = firebase.database().ref(key);
		playingRef.on('value', function(songId) {
			if (typeof $rootScope.playing == "undefined" || songId.val().songId != $rootScope.playing.id) {
				$rootScope.getSong(songId.val().songId, function (song) {
					$rootScope.playing = song;
					$rootScope.playing.skiped = songId.val().skiped;
				});
				$rootScope.skip_enabled = true;
				$timeout(function() {}, 10);
				get_connected();
			} else {
				$rootScope.playing.skiped = songId.val().skiped;
			}
		});

		var key = 'playlist/' + location.id;
		playlistRef = firebase.database().ref(key);
		playlistRef.on('value', function(playlist) {
			$rootScope.playlist = playlist.val().playlist;
			console.log(".. playlist .. ");
			console.log($rootScope.playlist);
			$rootScope.playlist.forEach( function (song) {
				console.log(song);
				if (typeof song.artistId !== "undefined") {
					$rootScope.getArtist(song.artistId, function (artist) {
						song.artistName = artist.name;
					});
				}
			});
		});
	}

	firebase.database().ref('concours').on('value', function (snapshot) {
		$rootScope.$apply(function() {
			var c = snapshot.val();
			$rootScope.concours = [];
			Object.keys(c).forEach( function (k) {
				if (c[k].enabled) {
					c[k].id = k;
					$rootScope.concours.push(c[k]);
				}
			});
		});
	});

	var pingStarted = false;
	var ping = function () {
		if (!$rootScope.user) return;
		var url_part = "";
		if (global_pos != null)
			url_part = "&loc=" + global_pos.latitude + "+" + global_pos.longitude;
		var url = jukenet_url_backend + "/jukenet_svc/remote/ping?userId=" + $rootScope.user.uid;
		if (typeof $rootScope.location !== "undefined" && typeof $rootScope.location.id !== "undefined")
			url_part += "&serverId=" + $rootScope.location.id;
		url = url + url_part;
		$.get(url, function(data, status) {
		});
	}

	var intPing;
	var startPing = function (temps) {
		if (pingStarted) {
			clearInterval(intPing);
		}
		pingStarted = true;
		intPing = setInterval( function () {
			ping();
		}, temps);
		ping();
	}
	startPing(60000);

	$rootScope.logoff = function () {
		facebookConnectPlugin.logout( function() {}, function() {} );
		firebase.auth().signOut().then(function() {
			// Sign-out successful.
			$rootScope.user = {}
			$state.go('auth',{});
		}, function(error) {
			alert("Sorry. something wrong happen");
		});
	}
});

app.directive('ngAllowTab', function () {
    return function (scope, element, attrs) {
        element.bind('keydown', function (event) {
            if (event.which == 9) {
                event.preventDefault();
                var start = this.selectionStart;
                var end = this.selectionEnd;
                element.val(element.val().substring(0, start) 
                    + '\t' + element.val().substring(end));
                this.selectionStart = this.selectionEnd = start + 1;
                element.triggerHandler('change');
            }
        });
    };
});

angular.element(function() {
	angular.bootstrap(document, ['app']);
});
