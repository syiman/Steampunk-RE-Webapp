app.controller('AuthCtrl', ['$scope', '$location', '$interval', 'DataService', function ($scope, $location, $interval, DataService) {
    var id = fetch();
    $scope.ready = false;
    var checkGapi = $interval(checkAuth, 250);
    var sheetId = '16z6l4rfiOPMszGe3sWg1fRylMzD8D_Qld_HgfYyyu5g';
    $scope.loadingIcon = pickLoadingIcon();
    var bar = document.getElementById('progress'); 
    var characterData, charImages, wIndex, charSkills, skillDescriptions;
    
    //Set div visibility
    var authorizeDiv = document.getElementById('authorize-div');
    var loadingDiv = document.getElementById('loading-div');
    var bar = document.getElementById('progress');
    loadingDiv.style.display = 'none';
    bar.style.value = '0px';
    
    //Continue to check gapi until it's loaded
    function checkAuth() {
    	if(gapi.client != undefined){
    		$scope.ready = true;
    		$interval.cancel(checkGapi);
    	}
    }
    
    /*$scope.openSurvey = function(){
    	var win = window.open("https://goo.gl/forms/yZUzLiOWCn719OQV2", '_blank');
    	win.focus();
    };*/
    
    //Initiate auth flow in response to user clicking authorize button.
    $scope.loadAPI = function(event) {
    	gapi.client.init({
    		'apiKey': id, 
    		'discoveryDocs': ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
    	}).then(function(){
    		authorizeDiv.style.display = 'none';
    		loadingDiv.style.display = 'inline';
    		fetchMapURL();
    	});
    };
    
    function fetchMapURL(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "COLUMNS",
            valueRenderOption: "FORMULA",
            range: 'Current Map!A1',
          }).then(function(response) {
        	  var url = response.result.values[0][0];
        	  DataService.setMap(processImgUrl(url));
        	  //updateProgressBar(); //update progress bar
        	  fetchCharacterData();
          });
    	
    };
    
    function pickLoadingIcon(){
    	var rand = Math.floor((Math.random() * 12) + 1); //generate a number between one and twelve
    	switch(rand){
	    	case 1: return "IMG/gif_1.gif"; break;
	    	case 2: return "IMG/gif_2.gif"; break;
	    	case 3: return "IMG/gif_3.gif"; break;
	    	case 4: return "IMG/gif_4.gif"; break;
	    	case 5: return "IMG/gif_5.gif"; break;
	    	case 6: return "IMG/gif_6.gif"; break;
	    	case 7: return "IMG/gif_7.gif"; break;
	    	case 8: return "IMG/gif_8.gif"; break;
	    	case 9: return "IMG/gif_9.gif"; break;
	    	case 10: return "IMG/gif_10.gif"; break;
	    	case 11: return "IMG/gif_11.gif"; break;
	    	case 12: return "IMG/gif_12.gif"; break;
    	}
    };

    //Fetch whole formatted spreadsheet
    function fetchCharacterData() {
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        majorDimension: "COLUMNS",
        range: 'Stats!A1:P37',
      }).then(function(response) {
    	 characterData = response.result.values;
    	 updateProgressBar(); //update progress bar
    	 fetchWeaponIndex();
      });
    };
    
    function fetchWeaponIndex(){
  	  //Fetch weapon information sheet
  	  gapi.client.sheets.spreadsheets.values.get({
         spreadsheetId: sheetId,
         majorDimension: "ROWS",
         range: 'Weapon Index!A2:L',
      }).then(function(response) {
    	  wIndex = response.result.values;
	      updateProgressBar(); //update progress bar
	      fetchSkillInfo();
      });
    };
    
    //Fetch skills/descriptions for each character and append them
    function fetchSkillInfo(){
    	//Fetch skill names for each character
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "COLUMNS",
            range: 'Stats!A19:P23',
          }).then(function(response) {
        	  charSkills = response.result.values;
        	  updateProgressBar(); //update progress bar
        	  fetchSkillDesc();
          });
    };
    
    //Fetch normal skills and their matching descriptions
    function fetchSkillDesc(){
  	  gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Skills!A2:E',
          }).then(function(response) {
          	 skillDescriptions = response.result.values;
          	 updateProgressBar(); //update progress bar
          	fetchPlayerImageData();
          });
    };
    
    //Fetch image URLs and append them to characterData
    function fetchPlayerImageData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            valueRenderOption: "FORMULA",
            range: 'Player Stats!B3:3',
        }).then(function(response) {
        	charImages = response.result.values[0];
         	updateProgressBar(); //update progress bar
         	fetchEnemyImageData();
        });
    };
    
    function fetchEnemyImageData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            valueRenderOption: "FORMULA",
            range: 'Enemy Stats!B3:3',
        }).then(function(response) {
        	charImages = charImages.concat(response.result.values[0]);
         	updateProgressBar(); //update progress bar
         	processCharData();
         	redirect();
        });
    };
    
    function processCharData(){
     	 for(var i = 0; i < characterData.length; i++){
     		
     		characterData[i].push(processImgUrl(charImages[i]));
     		 
     		 //Replace character skills
     		for(var j = 18; j < 23; j++)
                characterData[i][j] = findSkill(characterData[i][j]);

     		//Replace character weapons
     		for(var k = 23; k < 28; k++){
     			var info = findWeapon(characterData[i][k]);
     			info[0] = characterData[i][k]; //replace old name
     			characterData[i][k] = info;
     	 	}
     	 }
     	 
     	 DataService.setEnemies(characterData); //save compiled data
    };

    //Search for skill
    function findSkill(skill){
    	if(skill == "None")
    		return [skill, ,"???","???", "?", "There is no skill here."];
    		
        for(var i = 0; i < skillDescriptions.length; i++)
            if(skillDescriptions[i][0] == skill)
                return skillDescriptions[i];
        return [skill, ,"???","???", "?", "Skill data could not be found."];
    };
    
    function findWeapon(name){
    	if(name == "")
    		return [name, "Unknown", "E", "0", "0", "0", "0", "0", "0", "0|0", "I'm a blank item!"];
    	
    	//Remove parenthesis from end of name
    	if(name.indexOf("(") != -1)
    		name = name.substring(0,name.indexOf("(")-1);
    	
    	//Locate item
    	for(var i = 0; i < wIndex.length; i++)
    		if(wIndex[i][0] == name)
    			return wIndex[i].slice();
    	return [name, "Unknown", "?", "?", "?", "?", "?", "?", "?", "?|?", "Could not locate item. Please contact Deallocate"];
    };
    
    function processImgUrl(str){
    	var start = str.indexOf("\"")+1;
		var end = str.lastIndexOf("\"");
		var url = str.substring(start, end);
		 
		//Append "s" to "http" if needed
		if(url.substring(0,5) != "https")
			url = url.substring(0,4) + "s" + url.substring(4,url.length);
		return url; 
    };
    
    function fetch(){
    	var request = new XMLHttpRequest();
    	request.open('GET', 'LIB/text.txt', false);
    	request.send();
    	if (request.status == 200)
    		return request.responseText;
    };
    
    //Increments the progress bar by %
    function updateProgressBar(){
    	bar.value = bar.value + 14.2;
    };

    //Redirect user to the map page once data has been loaded
    function redirect(){
    	$location.path('/map').replace();
    	$scope.$apply();
    };
}]);