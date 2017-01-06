app.controller('AuthCtrl', ['$scope', '$location', '$interval', 'DataService', function ($scope, $location, $interval, DataService) {
    var id = fetch();
    $scope.ready = false;
    var terrainData = [];
    var checkGapi = $interval(checkAuth, 250);
    var sheetId = '1mcRF3jqVMOkmRNqB6O5pQTasZPOhpamvkymprDTa1Y0';
    $scope.loadingIcon = pickLoadingIcon();
    $scope.loadingText = pickLoadingText();
    var bar = document.getElementById('progress'); 
    var characterData, charImages, wIndex, charSkills, skillDescriptions, classStats, statusEffData, blurbs, terrain, iTerrain;
    
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
    		'apiKey': 'AIzaSyBSZCbIyuHl7oGCMN28ww550AYIpsr3S_w', //id
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
        	  updateProgressBar();
        	  DataService.setMap(processImgUrl(url));
        	  //updateProgressBar(); //update progress bar
        	  fetchCharacterData();
          });
    	
    };
    
    function pickLoadingIcon(){
    	
    	return "IMG/loadingImage.gif";
    	/*var rand = Math.floor((Math.random() * 11) + 1); //generate a number between one and twelve
    	switch(rand){
	    	case 1: return "IMG/gif_1.gif"; break;
	    	case 2: return "IMG/gif_2.gif"; break;
	    	case 3: return "IMG/gif_3.gif"; break;
	    	case 4: return "IMG/gif_4.gif"; break;
	    	case 5: return "IMG/gif_5.gif"; break;
	    	case 6: return "IMG/gif_6.gif"; break;
	    	case 7: return "IMG/gif_7.gif"; break;
	    	case 8: return "IMG/gif_9.gif"; break;
	    	case 9: return "IMG/gif_10.gif"; break;
	    	case 10: return "IMG/gif_11.gif"; break;
	    	case 11: return "IMG/gif_12.gif"; break;
    	}*/
    };
    
    function pickLoadingText(){
    	var rand = Math.floor((Math.random() * 10) + 1);
    	switch(rand){
	    	case 1: return "Being passiveaggressive to Deallocate in Dms..."; break;
	    	case 2: return "Trying to not cry..."; break;
	    	case 3: return "Deleting evidenceiamatalentlesshack.txt..."; break;
	    	case 4: return "Putting name on webapp..."; break;
	    	case 5: return "Whistling Casually..."; break;
	    	case 6: return "Fixing a bug Deallocate intentionally left in..."; break;
	    	case 7: return "Staring at loading bar..."; break;
	    	case 8: return "Being the edgy team..."; break;
	    	case 9: return "Pointlessly trying to draw up hype..."; break;
	    	case 10: return "Staring into mug of coffee..."; break;
    	}
    };

    //Fetch whole formatted spreadsheet
    function fetchCharacterData() {
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        majorDimension: "COLUMNS",
        range: 'Stats!A1:44',
      }).then(function(response) {
    	 characterData = response.result.values;
    	 updateProgressBar();
    	 fetchCharacterBlurb();
      });
    };
    
    function fetchCharacterBlurb() {
        gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          majorDimension: "COLUMNS",
          range: 'Stats!A105:105',
        }).then(function(response) {
         blurbs = response.result.values;
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
	      fetchTerrainIndex();
      });
    };
    
    function fetchTerrainIndex(){
    	  //Fetch weapon information sheet
    	  gapi.client.sheets.spreadsheets.values.get({
           spreadsheetId: sheetId,
           majorDimension: "ROWS",
           range: 'Terrain Chart!A2:K',
        }).then(function(response) {
      	  iTerrain = response.result.values;
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
         	fetchClassData();
        });
    };
    
    function fetchClassData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            //valueRenderOption: "FORMULA",
            range: 'Class Stats!A2:AI',
        }).then(function(response) {
        	classStats = response.result.values;
         	updateProgressBar(); //update progress bar
         	fetchTerrainChart();
        });
    };
    
    function fetchTerrainChart(){
    	var data = "";
    	  //Fetch terrain information sheet
    	  gapi.client.sheets.spreadsheets.values.get({
           spreadsheetId: sheetId,
           majorDimension: "ROWS",
           range: 'Terrain Locations!A2:B',
        }).then(function(response) {
      	  terrain = response.result.values;
      	  
      	  //Initialize terrianData with "Plain" for all cells
	      for(var a = 0;a <= 32;a++){
	    	terrainData.push([]);
			for(var b = 0;b <= 32;b++)
				terrainData[a].push(["Plain","0","0"]);
	      }
      	  
      	  for(var i = 0;i < terrain.length;i++){
    		var tempColumn = parseInt(terrain[i][0].substring(0,terrain[i][0].indexOf(",")));
    		var tempRow = parseInt(terrain[i][0].substring(terrain[i][0].indexOf(",")+1,terrain.length));
    		
        	for(var h = 0; h < iTerrain.length; h++){
        		if(iTerrain[h][0] == terrain[i][1]){
        			var j = h;
        		}
        	}
        	
    		//if(tempColumn <= 32 && tempRow <= 32)
    			terrainData[tempColumn][tempRow] = [terrain[i][1],iTerrain[j][1], iTerrain[j][2]];
    		
      	  }
      	  
	      DataService.setTerrain(terrainData);
  	      updateProgressBar(); //update progress bar
  	      fetchStatusData();
        });
      };
    
    function fetchStatusData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            //valueRenderOption: "FORMULA",
            range: 'Status Effects!A2:D',
        }).	then(function(response) {
        	statusEffData = response.result.values;
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
     		
     		characterData[i][3] = classUpdate(i);
     		
     		characterData[i][29] = statusUpdate(i);
     		
     		characterData[i][33] = findTerrain(characterData[i][32]);
     		
     		characterData[i].push(blurbs[i]);
     		
     		
     	 }
     	 DataService.setEnemies(characterData); //save compiled data
    };

    function classUpdate(id){  
    	var temp;
    	var exporter;
    	name = characterData[id][3];
    	if(name == "Transporter"){
    		name = "Transporter (Wagon)";
    	}
    	
    	for(var i = 0;i < classStats.length;i++){
    		if(classStats[i][0]==name){
    			temp =  [characterData[id][3], classStats[i][34]];
    			var weaknesses = classStats[i][24];
    			var weakList = [];
    			
    			if(characterData[id][1] == "Reaper"){
    				weakList.push("Reaper");
    			}
    			if(characterData[id][1] == "Loveless"){
    				weakList.push("Loveless");
    			}

    			while(weaknesses.indexOf(",")!=-1){
    				var weakTemp = weaknesses.substring(0,weaknesses.indexOf(","));
    				weaknesses = weaknesses.substring(weaknesses.indexOf(",")+2,weaknesses.length);
    				
    				weakList.push(weakTemp.trim());
    			}

    			
    			//Grab last element if it exists
    			if(weaknesses.length > 0){
    				weaknesses = weaknesses;
    				weakList.push(weaknesses);
    			}
    			
    			temp.push(weakList);
    			return temp;
    		}
    	}
    	
    	//If no class information could be found, return default
    	return [name, "Class description not found.", []];
    }
    
    function statusUpdate(id){  
    	name = characterData[id][29];
    	
    	if(characterData[id][32]=="Defeated"){
    		name = "Defeated"
    	}

    	for(var i = 0;i < statusEffData.length;i++){
    		if(statusEffData[i][0]==name){
    			return [name, statusEffData[i][2],statusEffData[i][3]];
    		}
    	}
    	return [name, "Status effect description not found.","???"];
    }
    
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
    		return [name, "Unknown", "-", "-", "-", "-", "-", "-", "-", "-|-", "Could not locate item. Please contact Deallocate"];
    	
    	//Remove parenthesis from end of name
    	if(name.indexOf("(") != -1)
    		name = name.substring(0,name.indexOf("(")-1);
    	
    	//Locate item
    	for(var i = 0; i < wIndex.length; i++)
    		if(wIndex[i][0] == name)
    			return wIndex[i].slice();
    	return [name, "Unknown", "-", "-", "-", "-", "-", "-", "-", "-|-", "Could not locate item. Please contact Deallocate"];
    };
    
    function findTerrain(name){
    	var data = "";
    	if(name == "")
    		return ["Plain",0,0,"No effect.","Flat terrain which gives neither side the advantage in battle."];
    	
    	if(name == "Defeated")
    		data = "Unknown"
    	
    	//Locate item
    	for(var i = 0; i < terrain.length; i++){
    		if(terrain[i][0] == name){
    			data = terrain[i][1];
    		}
    	}
    	for(var i = 0; i < iTerrain.length; i++){
    		if(iTerrain[i][0] == data){
    			return [iTerrain[i][0], iTerrain[i][1], iTerrain[i][2], iTerrain[i][9], iTerrain[i][10]];
    		}
    	}
    	
    	
    	return ["Plain",0,0,"No effect.","Flat terrain which gives neither side the advantage in battle."];
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
    	bar.value = bar.value + 9.09;
    };

    //Redirect user to the map page once data has been loaded
    function redirect(){
    	$location.path('/map').replace();
    	$scope.$apply();
    };
}]);
