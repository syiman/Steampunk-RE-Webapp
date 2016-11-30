app.controller('HomeCtrl', ['$scope', '$location', '$interval', 'DataService', function ($scope, $location, $interval, DataService) {
	var onLoad = checkData();
	$scope.rows = ["A"];
    $scope.columns = ["1"];
	//$scope.kaden = "IMG/moth_flier.png";
    var rowTimer = $interval(calcNumRows, 250, 20); //attempt to get rows 20 times at 250 ms intervals (total run: 5 sec)
    var colTimer = $interval(calcNumColumns, 250, 20);
    
    //Reroutes the user if they haven't logged into the app
    //Loads data from the DataService if they have
    function checkData(){
    	if(DataService.getEnemies() == null)
    		$location.path('/');
    	else{
    		//$scope.charaData = DataService.getCharacters();
    		$scope.enemyData = DataService.getEnemies();
    	}
    };
    
    /* Using the height of the map image, calculates the number of tiles tall
     * the map is and returns a subsection of the rowNames array of that size.
     * Called every 250 ms for the first 5 seconds the app is open.
     */
    function calcNumRows(){
    	var map = document.getElementById('map');
    	if(map != null){
    		var height = map.naturalHeight; //calculate the height of the map
        	
        	//height -= 16;
        	height = height / 16;
        	var temp = [];
        	
        	for(var i = 0; i < height; i++)
        		temp.push(i+1);
        	
        	if(temp.length != 0){
        		$interval.cancel(rowTimer); //cancel $interval timer
        		$scope.rows = temp;
        	}
    	}
    };
    
    /* Using the width of the map image, calculates the number of tiles wide
     * the map is and returns an array of that size.
     * Called every 250 ms for the first 5 seconds the app is open.
     */
   function calcNumColumns(){
    	var map = document.getElementById('map');
    	if(map != null){
    		var width = map.naturalWidth; //calculate the height of the map
        	
        	//width -= 16;
        	width = width / 16;
        	var temp = [];
        	
        	for(var i = 0; i < width; i++)
        		temp.push(i+1);
        	
        	if(temp.length != 0){
        		$interval.cancel(colTimer); //cancel $interval timer
        		$scope.columns = temp;
        	}
    	}
    };
    
    //*************************\\
    // FUNCTIONS FOR CHARACTER \\
    // INFO BOX                \\
    //*************************\\
    
    //Sets the character to display in the information box
    $scope.displayData = function(index){
    	if($scope.loadedChar == undefined)
    		positionCharBox(index);
    	
    	//Close the box if you click the same character again
    	if($scope.loadedChar == $scope.charaData[index])
    		$scope.loadedChar = undefined;
    	else 
    		$scope.loadedChar = $scope.charaData[index];
    };
    
    //Removes the character being displayed in the info box and hides it
    $scope.removeData = function(){
    	$scope.loadedChar = undefined;
    };
    
    //********************\\
    // FUNCTIONS FOR UNIT \\
    // PAIRUPS            \\
    //********************\\
    
    //Returns true if a character has a position coordinate
    $scope.hasPos = function(index){
    	return charPos[index] != "";
    };
    
    //Returns true if the enemy has a coordinate on the map
    //Units in the back of a pair up should have a coordinate of ""
    $scope.enemyHasPos = function(index){
    	return $scope.enemyData[index][33-1].indexOf(",") != -1;
    };
    
    //Returns true if the currently loaded character is paired up with another character
    $scope.ifPaired = function(){
    	if($scope.loadedChar == undefined) return false;
    	return $scope.loadedChar[57] != "None";
    };
    
    //Returns true if the enemy at index is paired up
    $scope.enemyIsPaired = function(index){
    	var loc = $scope.enemyData[index][33-1];
    	return loc != "" && loc.indexOf(",") == -1;
    };
    
    //Returns true if the unit at index is paired up
    $scope.isPairedAllChars = function(index){
    	return $scope.charaData[index][57] != "None";
    };
    
    //Returns the image URL for the unit in the back of a pairup
    $scope.getPairUnitIcon = function(index){
    	var pairedUnit = $scope.charaData[index][57]; //get paired unit's name
    	var found = false;
    	var inc = 0;
    	
    	//Find paired unit
    	while(!found && inc < $scope.charaData.length){
    		if($scope.charaData[inc][0] == pairedUnit){
    			found = true;
    		}else inc++;
    	}
    	
    	return $scope.charaData[inc][99];
    };

    //Switches char info box to show the stats of the paired unit
    //Triggered when char info box "Switch to Paired Unit" button is clicked
    $scope.findPairUpChar = function(){
    	if($scope.loadedChar == undefined) return false;
    	var pairedUnit = $scope.loadedChar[57]; //get paired unit's name
    	var found = false;
    	var inc = 0;
    	
    	//Find paired unit
    	while(!found && inc < $scope.charaData.length){
    		if($scope.charaData[inc][0] == pairedUnit){
    			$scope.loadedChar = $scope.charaData[inc];
    			found = true;
    		}else inc++;
    	}
    };
    
    /* Triggered when the enemy's "Switch to Paired Unit" button is clicked
     * Finds paired unit, relocates its info box to the same position as the currently
     * open one and displays it. Old info box is hidden.
     * WARNING: DOESN'T WORK PROPERLY IF BOTH UNITS ARE DISPLAYED BECAUSE OF RELIANCE
     * ON SPRITE BEING HIDDEN
     */
    $scope.toggleEnemyPair = function(index){
    	var pairUp = $scope.enemyData[index][2]; //get paired unit's name
    	var found = false;
    	var inc = 0;
    	
    	//Find paired unit
    	while(!found && inc < $scope.enemyData.length){
    		if($scope.enemyData[inc][0] == pairUp) found = true;
    		else inc++;
    	}
    	
    	//Checks if the enemy the info box belongs to is hidden
    	var spriteHidden;
    	if(enemyPos[index] == "") spriteHidden = true;
    	else spriteHidden = false;
    	
    	//Collect info about the current info box and the info box to be displayed
    	var currBox = document.getElementById('enemy_' + index + '_box');
    	var currBoxScope = angular.element(currBox).scope();
    	var pairBox = document.getElementById('enemy_' + inc + '_box');
    	var pairBoxScope = angular.element(pairBox).scope();
    	
    	//Toggle visibility
    	currBoxScope.viewInfo = false;
    	pairBoxScope.viewInfo = true;
    	
    	//If the sprite is not hidden (enemy is in front of pair up), relocate paired unit's info box
    	if(!spriteHidden){
    		var currEnemy = document.getElementById('enemy_' + index);
    		pairBox.style.top = (currBox.offsetTop + currEnemy.offsetTop) + 'px';
        	pairBox.style.left = (currBox.offsetLeft + currEnemy.offsetLeft) + 'px';
    	}
    };
    
    //***********************\\
    // FUNCTIONS FOR STAT    \\
    // PROCESSING/FORMATTING \\
    //***********************\\
    
    //Returns true if the rate of atk/crit/hit/avo (@ index) is greater than 0
    $scope.checkRate = function(index){
    	if($scope.loadedChar == undefined) return false;
    	return parseInt($scope.loadedChar[index]) >= 0;
    };
    
    //Returns true if the rate of attack/crit/hit/avo (@ stat) is greater than 0
    //for the enemy (@ index)
    $scope.eCheckRate = function(index, stat){
    	return parseInt($scope.enemyData[index][stat]) >= 0;
    };
    
    /* Calculates total buff/debuffs for each stat (str/mag/skl/etc) and
     * returns the appropriate text color as a hex value
     * red <- total<0
     * blue <- total>0
     * tan <- total=0
     */
    $scope.determineStatColor = function(stat){
    	var color = "#E5C68D"; //default tan
    	var debuff, weaponBuff, pairUp;
    	
    	if($scope.loadedChar == undefined) return color; //returns tan
    	
    	//Determine appropriate indicies for stat being evaluated (passed string)
    	switch(stat){
	    	case "str": debuff = 19; weaponBuff = 45; pairUp = 59; break;
	    	case "mag": debuff = 20; weaponBuff = 46; pairUp = 60; break;
	    	case "skl": debuff = 21; weaponBuff = 47; pairUp = 61; break;
	    	case "spd": debuff = 22; weaponBuff = 48; pairUp = 62; break;
	    	case "lck": debuff = 23; weaponBuff = 49; pairUp = 63; break;
	    	case "def": debuff = 24; weaponBuff = 50; pairUp = 64; break;
	    	case "res": debuff = 25; weaponBuff = 51; pairUp = 65; break;
	    	default: return color; break;
    	}
    	
    	if($scope.loadedChar[debuff] == "") debuff = 0;
    	else debuff = parseInt($scope.loadedChar[debuff]);
    	
    	weaponBuff = parseInt($scope.loadedChar[weaponBuff]);
    	
    	if($scope.loadedChar[pairUp] == "") pairUp = 0;
    	else pairUp = parseInt($scope.loadedChar[pairUp]);
    	
    	var totalBuffs = debuff + weaponBuff + pairUp;
    	if(totalBuffs > 0)
    		color = "#42adf4"; //blue buff
    	else if(totalBuffs < 0)
    		color = "#960000"; //red debuff
    	return color;
    };
    
    /* Calculates total buff/debuffs for each stat (str/mag/skl/etc) and
     * returns the appropriate text color as a hex value
     * red <- total<0
     * blue <- total>0
     * tan <- total=0
     */
    $scope.determineEnemyStatColor = function(stat, index){
    	var color = "#E5C68D"; //default tan
    	return color;
    	
    	/*var locs = getEnemyBuffLocs(stat);
    	var debuff = locs[0];
    	var weaponBuff = locs[1]; 
    	var pairUp = locs[2];
    	
    	var enemy = $scope.enemyData[index];
    	debuff = parseInt(enemy[debuff]);
    	weaponBuff = parseInt(enemy[weaponBuff]);
    	if(enemy[pairUp] == "") pairUp = 0;
    	else pairUp = parseInt(enemy[pairUp]);
    	
    	var totalBuffs = debuff + weaponBuff + pairUp;
    	if(totalBuffs > 0)
    		color = "#42adf4"; //blue buff
    	else if(totalBuffs < 0)
    		color = "#960000"; //red debuff
    	return color;*/
    };
    
    
    //Helper function
    function getEnemyBuffLocs(stat){
    	var debuff, weaponBuff, pairUp;
    	
    	//Determine appropriate indicies for stat being evaluated (passed string)
    	switch(stat){
	    	case "str": debuff = 16; weaponBuff = 59; pairUp = 66; break;
	    	case "mag": debuff = 17; weaponBuff = 60; pairUp = 67; break;
	    	case "skl": debuff = 18; weaponBuff = 61; pairUp = 68; break;
	    	case "spd": debuff = 19; weaponBuff = 62; pairUp = 69; break;
	    	case "lck": debuff = 20; weaponBuff = 63; pairUp = 70; break;
	    	case "def": debuff = 21; weaponBuff = 64; pairUp = 71; break;
	    	case "res": debuff = 22; weaponBuff = 65; pairUp = 72; break;
    	}
    	
    	return [debuff, weaponBuff, pairUp];
    };
    
    //Checks if there is a value in the index
    $scope.validDebuff = function(index){
    	if($scope.loadedChar == undefined) return false;
    	return $scope.loadedChar[index] != "";
    };
    
    //Returns true if the enemy has a non-zero entry for a stat's debuff
    $scope.eValidDebuff = function(enemy, index){
    	return $scope.enemyData[enemy][index] != "0";
    };
    
    //Checks if the value in the index is != 0
    $scope.validWeaponBuff = function(index){
    	if($scope.loadedChar == undefined) return false;
    	return $scope.loadedChar[index] != "0";
    };
    
    //Checks if the loaded character is a) paired with someone
    //and b) if the stat has a buff that is != 0
    //Version for characters
    $scope.validPairUpBuff = function(index){
    	if($scope.loadedChar == undefined) return false;
    	var value = $scope.loadedChar[index];
    	return value != "" && value != "0";
    };
    
    //Returns true if the enemy's stat (str/mag/etc) has a non-zero value
    //Version for enemies
    $scope.eValidPairUpBuff = function(enemy, stat){
    	var s = $scope.enemyData[enemy][stat];
    	return s != "" && s != "0";
    };
    
    //If a weapon increases a stat (str/mag/etc), append that value with
    //a plus (ex. "5" -> "+5")
    //Version for characters
    $scope.formatWeaponBuff = function(index){
    	var value = parseInt($scope.loadedChar[index]);
    	if(value > 0) return "+" + value;
    	else return value;
    };
    
    //If a weapon increases a stat (str/mag/etc), append that value with
    //a plus (ex. "5" -> "+5")
    //Version for enemies
    $scope.eFormatWeaponBuff = function(index, stat){
    	var value = parseInt($scope.enemyData[index][stat]);
    	if(value > 0) return "+" + value;
    	else return value;
    };
    
    //Calculates the base value for an enemy's stat (str/mag/etc) by subtracting
    //debuff/buffs from the total stat value
    $scope.calcEnemyBaseStat = function(index, stat){
    	var locs = getEnemyBuffLocs(stat);
    	var debuff = locs[0];
    	var weaponBuff = locs[1]; 
    	var pairUp = locs[2];
    	var total;
    	
    	switch(stat){
	    	case "str": total = 7; break;
	    	case "mag": total = 8; break;
	    	case "skl": total = 9; break;
	    	case "spd": total = 10; break;
	    	case "lck": total = 11; break;
	    	case "def": total = 12; break;
	    	case "res": total = 13; break;
    	}
    	
    	var enemy = $scope.enemyData[index];
    	total = parseInt(enemy[total]);
    	debuff = parseInt(enemy[debuff]);
    	weaponBuff = parseInt(enemy[weaponBuff]);
    	if(enemy[pairUp] == "") pairUp = 0;
    	else pairUp = parseInt(enemy[pairUp]);
    	
    	return total - (debuff + weaponBuff + pairUp);
    };
    
    //*************************\\
    // FUNCTIONS FOR INVENTORY \\
    // WEAPONS PROFICIENCY     \\
    //*************************\\
    
    //Checks if a weapon name is a valid type, so that weapon proficiency can be displayed
    //Version for characters
    $scope.existsWeapon = function(index){
    	if($scope.loadedChar == undefined) return false;
    	return compareWeaponName($scope.loadedChar[index]);
    };
    
    //Checks if a weapon name is a valid type, so that weapon proficiency can be displayed
    //Version for enemies
    $scope.existsEnemyWeapon = function(enemy,index){
    	return $scope.enemyData[enemy][index] != "-";
    };
    
    //Helper function
    function compareWeaponName(weaponName){
    	return weaponName != "" && weaponName != "N/A";
    };
    
    //Returns the weapon rank icon relevant to the passed weapon type
    $scope.weaponIcon = function(index){    	
    	var w = $scope.loadedChar[index];
    	return getIcon(w);
    };
    
    //Returns the weapon rank icon relevant to the passed weapon type
    $scope.enemyWeaponIcon = function(enemy,index){
    	var w = $scope.enemyData[enemy][index];
    	w = w.substring(2, w.length);
    	return getIcon(w);
    };
    
    //Helper function :)
    function getIcon(weaponName){
    	var c = weaponName.toLowerCase();
    	return "IMG/rank_" + c + ".png";
    };
    
    //Returns the first character in the passed string
    $scope.formatWeaponRank = function(str){
    	return str.substring(0,1);
    };
    
    //Calculates the percentage of weapon proficicency for a specific weapon,
    //then returns the width of the progress bar in pixels
    $scope.calcWeaponExp = function(index){
    	if($scope.loadedChar == undefined) return 0;
    	
    	var exp = $scope.loadedChar[index];
    	var slash = exp.indexOf("/");
    	var progress = parseInt(exp.substring(0,slash));
    	var total = parseInt(exp.substring(slash+1,exp.length));
    	
    	return (progress/total) * 30; //30 is the max number of pixels
    };
    
    //Checks to see if the weapon name in the passed slot is null
    //Version for characters
    $scope.validWeapon = function(index){
    	if($scope.loadedChar == undefined) return false;
    	
    	var weaponName = $scope.loadedChar[index][0];
    	if(weaponName != "-" && weaponName != "- (-)")
    		return true;
    	else return false;
    };
    
    //Checks to see if the weapon name in the passed slot is null
    //Version for enemies
    $scope.validEnemyWeapon = function(enemy, index){
    	var weaponName = $scope.enemyData[enemy][index][0];
    	if(weaponName != "")
    		return true;
    	else return false;
    };
    
    //Returns true if the weapon at the index has a description
    $scope.weaponHasDes = function(index){
    	if($scope.loadedChar == undefined) return false;
    	return $scope.loadedChar[index].length == 20;
    };
    
    $scope.eWeaponHasDes = function(w, index){
    	return true;
    	//return $scope.enemyData[index][w].length == 20;
    };
    
    //Returns true if the weapon at the index has a listed range
    $scope.hasWeaponRange = function(index){
    	if($scope.loadedChar == undefined) return false;
    	return $scope.loadedChar[index][18] != "";
    };
    
    $scope.eHasWeaponRange = function(w, index){
    	return true;
    	//return $scope.enemyData[index][w][18] != "";
    };
    
    //Returns true if the weapon at the index has a listed rank
    $scope.hasWeaponRank = function(index){
    	if($scope.loadedChar == undefined) return false;
    	return $scope.loadedChar[index][4] != "";
    };
    
    $scope.eHasWeaponRank = function(w, index){
    	return true;
    	//return $scope.enemyData[index][w][2] != "";
    };
    
    //Returns the icon for the class of the weapon at the index
    //Version for characters
    $scope.getWeaponClassIcon = function(index){
    	if($scope.loadedChar == undefined) return false;
    	var type = $scope.loadedChar[index][1];
    	type = type.toLowerCase();
    	return "IMG/type_" + type + ".png";
    };
    
    //Returns the icon for the class of the weapon at the index
    //Version for enemies
    $scope.getEnemyWeaponClassIcon = function(enemy,index){
    	var type = $scope.enemyData[enemy][index][1];
    	if(type == undefined) return "";
    	
    	type = type.toLowerCase();
    	return "IMG/type_" + type + ".png";
    };
   
    //Returns the image for a character's skill, if they're at the minimum
    //level to obtain it. Otherwise, returns the blank skill image.
    $scope.fetchSkillImage = function(minLvl){
    	if($scope.loadedChar == undefined) return "";
    	/*if(minLvl > parseInt($scope.loadedChar[2]))
    		return "IMG/SKL/skl_blank.png";*/
    	
    	var skillName;
    	
    	switch(minLvl){
	    	case 1: skillName = 105; break;
	    	case 5: skillName = 106; break;
	    	case 10: skillName = 107; break;
	    	case 15: skillName = 108; break;
	    	case 20: skillName = 109; break;
	    	case 25: skillName = 110; break;
	    	case 30: skillName = 111; break;
	    	case 35: skillName = 112; break;
    	}
    	
    	skillName = $scope.loadedChar[skillName][0];
    	skillName = skillName.toLowerCase();
    	skillName = skillName.replace(/ /g,"_");
    	return "IMG/SKL/skl_" + skillName + ".png";
    };
    
    $scope.eFetchSkillImage = function(enemy, skl){
		//var skillName = $scope.enemyData[enemy][skl][0];
    	//if(skillName == "-") return "IMG/SKL/skl_blank.png"; //no skill
    	if(skl == 42) return "IMG/SKL/skl_personal.png"; //personal skill
    	
    	skillName = skillName.toLowerCase();
    	skillName = skillName.replace(/ /g,"_");
    	return "IMG/type_" + skillName + ".png";
    };
    
    //For displaying enemy skill gems, checks to see if the enemy has a
    //skill name in that slot
    $scope.hasSkill = function(enemy,index){
    	return $scope.enemyData[enemy][index] != "None";
    };
    
    $scope.checkShields = function(value){
    	if($scope.loadedChar == undefined) return "IMG/emptyshield.png";
    	var num = parseInt($scope.loadedChar[17]);
    	if(num == 10) return "IMG/blueshield.png";
    	else if(num >= value) return "IMG/filledshield.png";
    	else return "IMG/emptyshield.png";
    };
    
    //Checks if the shield value for the passed enemy is greater than number
    $scope.checkEShields = function(enemy, value){
    	var num = parseInt($scope.enemyData[enemy][3]);
    	if(num == 10) return "IMG/blueshield.png";
    	else if(num >= value) return "IMG/filledshield.png";
    	else return "IMG/emptyshield.png";
    };
    
    $scope.enemyHasNum = function(index){
    	var name = $scope.enemyData[index][0];
    	if(name.lastIndexOf(" ") == -1 || name == undefined)
    		return false;
    	name = name.substring(name.lastIndexOf(" ")+1, name.length);
    	if(name.match(/^[0-9]+$/) != null) return true;
    	else return false;
    };
    
    //Parses an enemy's name to see if it contains a number at the end.
    //If it does, it returns that number
    $scope.getEnemyNum = function(index){
    	var name = $scope.enemyData[index][0];
    	name = name.substring(name.lastIndexOf(" ")+1, name.length);
    	return "IMG/num_" + name + ".png";
    };
    
    //***********************\\
    // POSITION CALCULATIONS \\
    // FOR VARIOUS THINGS    \\
    //***********************\\
    
    //Relocate the information box relative to the clicked char
    function positionCharBox(index){
    	var div = document.getElementById('char_'+index);
		var x = div.style.left;
    	var y = div.style.top;
    	x = parseInt(x.substring(0, x.length));
    	y = parseInt(y.substring(0, y.length));
    	
    	if(x < 671) x += 40;	
    	else x -= 671;
    	
    	if(y < 77) y += 40;
    	else y -= 77;
    	
    	drag.style.left = x + 'px';
    	drag.style.top = y + 'px';
    };
    
    //Using a character's coordinates, calculates their horizontal
    //position on the map
    $scope.determineX = function(index){
    	var pos = $scope.enemyData[index][33-1];
    	var comma = pos.indexOf(",");
    	if(comma == -1) return "0px";
    	
    	pos = pos.substring(0,comma); //grab first 1-2 chars
    	pos = parseInt(pos);
    	return ((pos*16)) + "px";
    };
    
    //Using a character's coordinates, calculates their vertical
    //position on the map
    $scope.determineY = function(index){
    	var pos = $scope.enemyData[index][33-1];
    	var comma = pos.indexOf(",");
    	if(comma == -1) return "0px";
    	
    	pos = pos.substring(comma+1,pos.length); //grab last 1-2 chars
    	pos = parseInt(pos);
    	return ((pos*16)) + "px";
    };
    
    //Returns the vertical position of a glowBox element
    $scope.determineGlowY = function(index){
    	//return (((index+1)*34)+2) + "px";
    	return (index*16) + "px";
    };
    
    //Returns the horizontal position of a glowBox element
    $scope.determineGlowX = function(index){
    	//return (index*34) + "px";
    	return (index*16) + "px";
    };
    
    //Calculates the vertical position of an enemy's information box,
    //relative to the enemy itself
    $scope.displayEInfoY = function(index){
    	var enemy = document.getElementById('enemy_'+index);
    	var map = document.getElementById('map');
    	var pageBottom = map.naturalHeight;
    	var top = -69;
    	var enemyTop = enemy.style.top;
    	enemyTop = parseInt(enemyTop.substring(0,enemyTop.length-2));
    	
    	if(enemyTop < 90) top = 0;
    	else if(enemyTop + 109 > pageBottom) top = -1* (pageBottom - enemyTop);
    	
    	return top + "px";
    };
    
    //Calculates the horiztonal position of an enemy's information box, relative
    //to the enemy itself
    $scope.displayEInfoX = function(index){
    	var enemy = document.getElementById('enemy_'+index);
    	var enemyLeft = enemy.style.left;
    	enemyLeft = parseInt(enemyLeft.substring(0,enemyLeft.length-2));
    	var left = -488;
    	
    	if(enemyLeft + left < 0) left = 37;
    	
    	return left + "px";
    };
    
    //*************************\\
    // SUPPORT FOR DRAGABILITY \\
    // OF CHAR INFO BOX        \\
    //*************************\\
    
    /*function dragStart(event){
    	var style = window.getComputedStyle(event.target, null);
        event.dataTransfer.setData("text/html",(parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
    };
    
    function dragOver(event){
    	event.preventDefault();
    	return false;
    };
    
    function dragEnter(event){
    	event.preventDefault();
    };
    
    function dropDiv(event){
    	event.preventDefault();
    	var drag = document.getElementById('infoBox');
    	var offset = event.dataTransfer.getData("text/html").split(',');
    	drag.style.left = (event.clientX + parseInt(offset[0],10)) + 'px';
    	drag.style.top = (event.clientY + parseInt(offset[1],10)) + 'px';
    };
    
    //Set event listeners to be activated when the div is dragged
    var drag = document.getElementById('infoBox');
    var drop = document.getElementById('dropArea');
    drag.addEventListener('dragstart',dragStart,false);
    drop.addEventListener('dragenter',dragEnter,false);
    drop.addEventListener('dragover',dragOver,false);
    drop.addEventListener('drop',dropDiv,false);*/
}]);