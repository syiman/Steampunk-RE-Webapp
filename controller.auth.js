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
    		fetchCharacterData();
    	});
    };
    
    function pickLoadingIcon(){
    	var rand = Math.floor((Math.random() * 14) + 1); //generate a number between one and twelve
    	switch(rand){
	    	case 1: return "IMG/cavalier.gif"; break;
	    	case 2: return "IMG/darkmage.gif"; break;
	    	case 3: return "IMG/diviner.gif"; break;
	    	case 4: return "IMG/fighter.gif"; break;
	    	case 5: return "IMG/kitsune.gif"; break;
	    	case 6: return "IMG/knight.gif"; break;
	    	case 7: return "IMG/ninja.gif"; break;
	    	case 8: return "IMG/samurai.gif"; break;
	    	case 9: return "IMG/spearfighter.gif"; break;
	    	case 10: return "IMG/thief.gif"; break;
	    	case 11: return "IMG/archer.gif"; break;
	    	case 12: return "IMG/skyknight.gif"; break;
	    	case 13: return "IMG/wolfskin.gif"; break;
	    	case 14: return "IMG/troubadour.gif"; break;
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
         range: 'Weapon Index!A2:K',
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
          	 processCharData();
          	 redirect();
          });
    };
    
    function processCharData(){
     	 for(var i = 0; i < characterData.length; i++){
     		
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
    		return [name, "Mystery", "E", "0", "0", "0", "0", "0", "0", "0|0", "I'm a blank item!"];
    	
    	//Remove parenthesis from end of name
    	if(name.indexOf("(") != -1)
    		name = name.substring(0,name.indexOf("(")-1);
    	
    	//Locate item
    	for(var i = 0; i < wIndex.length; i++)
    		if(wIndex[i][0] == name)
    			return wIndex[i].slice();
    	return [name, "Mystery", "E", "0", "0", "0", "0", "0", "0", "0|0", "Could not locate item."];
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