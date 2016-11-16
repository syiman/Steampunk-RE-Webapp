app.controller('AuthCtrl', ['$scope', '$location', '$interval', 'DataService', function ($scope, $location, $interval, DataService) {
    var id = fetch();
    $scope.ready = false;
    var checkGapi = $interval(checkAuth, 250);
    var salvSheetId = '15e6GxH-FkGeRXrx3shsVencuJTnT8eQdaVM2MY9yy7A';
    $scope.loadingIcon = pickLoadingIcon();
    var bar = document.getElementById('progress'); 
    var characterData, enemyData, charImages, charWeapons, wIndex, charSkills, skillDescriptions, personalSkillsDesc;
    
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
    
    $scope.openSurvey = function(){
    	var win = window.open("https://goo.gl/forms/yZUzLiOWCn719OQV2", '_blank');
    	win.focus();
    };
    
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
        spreadsheetId: salvSheetId,
        majorDimension: "ROWS",
        range: 'Ugly Characatures!A3:CU32',
      }).then(function(response) {
    	 characterData = response.result.values;
    	 updateProgressBar(); //update progress bar
    	 fetchImageData();
      });
    };
    
    //Fetch image URLs and append them to characterData
    function fetchImageData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: salvSheetId,
            majorDimension: "ROWS",
            valueRenderOption: "FORMULA",
            range: 'Characatures!B3:AH3',
        }).then(function(response) {
        	charImages = response.result.values[0];
         	updateProgressBar(); //update progress bar
         	fetchCharWeapons();
        });
    };
    
    //Fetch character inventories and append them to characterData
    function fetchCharWeapons(){
    	//Fetch inventories for each character
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: salvSheetId,
            majorDimension: "COLUMNS",
            range: 'Characatures!B27:AH31',
        }).then(function(response) {
        	charWeapons = response.result.values;
        	updateProgressBar(); //update progress bar
            fetchWeaponIndex();
        });
    };
    
    function fetchWeaponIndex(){
  	  //Fetch weapon information sheet
  	  gapi.client.sheets.spreadsheets.values.get({
         spreadsheetId: salvSheetId,
         majorDimension: "ROWS",
         range: 'Weapon Index!A2:T',
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
            spreadsheetId: salvSheetId,
            majorDimension: "COLUMNS",
            range: 'Characatures!B35:AG42',
          }).then(function(response) {
        	  charSkills = response.result.values;
        	  updateProgressBar(); //update progress bar
        	  fetchSkillDesc();
          });
    };
    
    //Fetch normal skills and their matching descriptions
    function fetchSkillDesc(){
  	  gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: salvSheetId,
            majorDimension: "ROWS",
            range: 'Skrillex!A1:B',
          }).then(function(response) {
          	 skillDescriptions = response.result.values;
          	 updateProgressBar(); //update progress bar
          	 fetchPersonalSkillDesc();
          });
    };
    
    //Fetch personal skills and their matching descriptions
    function fetchPersonalSkillDesc(){
    	gapi.client.sheets.spreadsheets.values.get({
    		spreadsheetId: salvSheetId,
            majorDimension: "ROWS",
            range: 'Personal Skrillex!B2:C',
        }).then(function(response) {
         	personalSkillsDesc = response.result.values;
            processCharData();
            updateProgressBar(); //update progress bar
            getEnemyData();
        });
    };
    
    function processCharData(){
     	 for(var i = 0; i < characterData.length; i++){
     		 
     		 //Properly format image URLs
    		 var str = charImages[i];
    		 if(str != ""){
    			 characterData[i].push(processImgUrl(str));
    		 }else{
    			 charImages.splice(i, 1);
    			 str = charImages[i];
    			 characterData[i].push(processImgUrl(str));
    		 }
    		 
    		 //Find and append weapons
    		 var charName = characterData[i][0];
    		 var column = charWeapons[i];
     		 if(charName == "Amy" || charName == "Asami" || charName == "Tristan"){
     			 //Dual column processing
     			 var uses = charWeapons[i+1];
     			 charWeapons.splice(i+1,1); //remove uses column, don't mess up alignment!
     			 
     			 for(var j = 0; j < column.length; j++){
     				var wRay = locateWeapon(column[j]);
     				wRay[0] = column[j] + " (" + uses[j] + ")"; //append name with (uses)
     				characterData[i].push(wRay);
     			 }
     		 }else{
     			 //Normal column processing
         		 for(var j = 0; j < column.length; j++){
         			var wRay = locateWeapon(column[j]);
         			wRay[0] = column[j]; //replace weapon name with original name
         			characterData[i].push(wRay);
         		 }
     		 }
     		 
     		 //Process character skills
     		 var skls = charSkills[i];
     		 if(skls.length == 0){
     			 charSkills.splice(i,1);
     			 skls = charSkills[i];
     		 }
     		 for(var j = 0; j < skls.length; j++)
     			 characterData[i].push(findSkill(skls[j], skillDescriptions));
     		 characterData[i].push(personalSkillsDesc[i]);
     	 }
     	 
     	 DataService.setCharacters(characterData); //save compiled data
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
    
    //Fetch the entire contents of the enemies spreadsheet
    function getEnemyData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: salvSheetId,
            majorDimension: "ROWS",
            range: 'Loser Cowards!A3:CD',
          }).then(function(response) {
       	   	  enemyData = response.result.values;
       	   	  
       	   	  //Remove blank/incomplete data from end of set
       	   	  var realEnemy = false;
       	   	  var index = enemyData.length-1;
       	   	  while(!realEnemy){
       	   		  if(enemyData[index].length >= 82) realEnemy = true;
       	   		  else{
       	   			  enemyData.splice(enemyData.length-1,1); //remove last element
       	   			  index--;
       	   		  }
       	   	  }
       	   	 
       	   	  for(var i = 0; i < enemyData.length; i++){
       	   		  //Replace weapon names with weapon data arrays
       	   		  for(var j = 29; j < 34; j++){
       	   			  enemyData[i][j] = locateWeapon(enemyData[i][j]);
       	   		  }
       	   		  
       	   		  //Replace skills with skill info array
       	   		  for(var j = 34; j < 42; j++){
	 	   			  if(enemyData[i][j] != "-")
	 	   				  enemyData[i][j] = findSkill(enemyData[i][j], skillDescriptions);
	 	   			  else enemyData[i][j] = ["-", "No skill."];
       	   		  }
       	   		  
       	   		  //Replace personal skill with skill info array
       	   		  if(enemyData[i][42] != "-")
       	   			  enemyData[i][42] = findSkill(enemyData[i][42], personalSkillsDesc);
 	   			  else enemyData[i][42] = ["-", "No skill."];
       	   	  }
       	   	  
       	      updateProgressBar(); //update progress bar
              DataService.setEnemies(enemyData); //save compiled data
              redirect(); //go to map page
          });
    };
    
    //Search for skill
    function findSkill(skill, list){
    	for(var i = 0; i < list.length; i++)
    		if(list[i][0] == skill)
    			return list[i];
    	return [skill, "A description could not be found for this skill. Is the name spelled correctly?"];
    };
    
    function locateWeapon(name){
    	if(name == undefined) //if last character in the string is G, it's money
    		return ["Undefined Item", "ERROR", "-", "0", "Z", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "-", "0", "Something's wrong here."];
    	
    	//Remove parenthesis from end of name
    	if(name.indexOf("(") != -1)
    		name = name.substring(0,name.indexOf("(")-1);
    	
    	//If last character in the string is G, it's money
    	if(name.indexOf("G") == name.length-1)
    		return [name, "Gold", "Gold", "0", "", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "Wealth", "", "I bet you could buy something nice with this."];
    	
    	//Locate item
    	for(var i = 0; i < wIndex.length; i++)
    		if(wIndex[i][0] == name)
    			return wIndex[i].slice();
    	
    	return [name, "Mystery", "Unknown", "0", "", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "0", "Confusion", "", "What could this be?"];
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