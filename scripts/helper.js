 /******************************************************************
 * A LIST OF HELPER FUNCTIONS *
 ******************************************************************/



 /* get color samples */
 /**
  * @function generateColorSamples()
  * @param {int} color_mean
  * @param {int} array_sd
  * @param {int} total_circles - number of items (color circles)
  */
 function generateColorSamples(color_mean,array_sd,total_circles) {
   function randomList(n, a, b) {
     // create a list of n numbers between a and b
     var list = [],
         i;
     for (i = 0; i < n; i++) {
       list[i] = Math.random() * (b - a) + a;
     }
     return list;
   }
   // create a list of random numbers between 1 and 10
   var list = randomList(total_circles, 1, 10);

   function descriptives(list) {
     // compute mean, sd and the interval range: [min, max]
     var mean,
         sd,
         i,
         len = list.length,
         sum,
         a = Infinity,
         b = -a;
     for (sum = i = 0; i < len; i++) {
       sum += list[i];
       a = Math.min(a, list[i]);
       b = Math.max(b, list[i]);
     }
     mean = sum / len;
     for (sum = i = 0; i < len; i++) {
       sum += (list[i] - mean) * (list[i] - mean);
     }
     sd = Math.sqrt(sum / (len - 1));
     return {
       mean: mean,
       sd: sd,
       range: [a, b]
     };
   }

   function forceDescriptives(list, mean, sd) {
     // transfom a list to have an exact mean and sd
     var oldDescriptives = descriptives(list),
         oldMean = oldDescriptives.mean,
         oldSD = oldDescriptives.sd,
         newList = [],
         len = list.length,
         i;
     for (i = 0; i < len; i++) {
       newList[i] = sd * (list[i] - oldMean) / oldSD + mean;
     }
     return newList;
   }

   // transform the list to have an exact mean of 5 and sd of 2
   var newList = forceDescriptives(list, color_mean, array_sd);

   // display the transformed list and descriptive statistics (mean and sd)
   console.log(descriptives(newList));

   return newList;
 }

 /* turn the colour samples into RGB values from blue to red */
 /**
  * @function generateRGBvalues()
  * @param {int} singleColorValue
  */
 function generateRGBvalues(singleColorValue) {
   var colorValue = [singleColorValue*255, 0, (1-singleColorValue)*255];
   return colorValue;
 }


 /* draw the squircle stimuli */
 /**
  * @function drawSquircleStimuli()
  * @param {Object} parent - parent div
  * @param {string} canvasID - ID for the canvas object
  * @param {int} canvasWidth
  * @param {int} canvasHeight
  * @param {int} total_circles
  * @param {int} radius
  * @param {int} color_mean
  * @param {int} array_sd
  * @param {int} color_mean_two
  * @param {string} moreRedSide - "left" or "right"
  */
 function drawSquircleStimuli(parent, canvasID, canvasWidth, canvasHeight, total_circles, radius,
                              color_mean,array_sd, color_mean_two, moreRedSide) {

   var canvas = document.getElementById(canvasID);
   var ctx = canvas.getContext("2d");

   //ctx.fillStyle = "red";

   var cy = canvas.height/2;
   var cxl = canvas.width / 2 - canvas.width / 3;
   var cxr = canvas.width / 2 + canvas.width / 3;

   var colorValuesArrayLeft = [];
   var colorValuesArrayRight = [];

   var moreRedMean = Math.max(color_mean, color_mean_two);
   var moreBlueMean = Math.min(color_mean, color_mean_two);

   if (moreRedSide === "left") {
     colorValuesArrayLeft = generateColorSamples(moreRedMean, array_sd, total_circles); //one number for each circle with defined mean and sd for the numbers
     colorValuesArrayRight = generateColorSamples(moreBlueMean,array_sd, total_circles);
   } else {
     colorValuesArrayLeft = generateColorSamples(moreBlueMean, array_sd, total_circles); //one number for each circle with defined mean and sd for the numbers
     colorValuesArrayRight = generateColorSamples(moreRedMean, array_sd, total_circles);
   }


   /*draw the left stimulus*/
   for (i = 0; i < total_circles; i++) {
     var singleColorValue = colorValuesArrayLeft[i];
     var colorValues = generateRGBvalues(singleColorValue);
     ctx.fillStyle = "rgb(" + colorValues[0] + "," + colorValues[1] + "," + colorValues[2] + ")";
     var angle = i * 2 * Math.PI / total_circles;
     var xl = cxl + Math.cos(angle) * radius;
     var y = cy + Math.sin(angle) * radius;
     ctx.beginPath();
     ctx.arc(xl, y, 21 - 0.5 * total_circles, 0, Math.PI * 2, true);
     ctx.closePath();
     ctx.fill();
   }

   /*draw the right stimulus*/
   for (i = 0; i < total_circles; i++) {
     var singleColorValue = colorValuesArrayRight[i];
     var colorValues = generateRGBvalues(singleColorValue);
     ctx.fillStyle = "rgb(" + colorValues[0] + "," + colorValues[1] + "," + colorValues[2] + ")";
     var angle = i * 2 * Math.PI / total_circles;
     var xr = cxr + Math.cos(angle) * radius;
     var y = cy + Math.sin(angle) * radius;
     ctx.beginPath();
     ctx.arc(xr, y, 21 - 0.5 * total_circles, 0, Math.PI * 2, true);
     ctx.closePath();
     ctx.fill();
   }
   return [colorValuesArrayLeft, colorValuesArrayRight];
 }



/* class DoubleDotGrid {
//   /**
//    * @constructor
//    * @param {int} nDotsL - number of dots in the left grid
//    * @param {int} nDotsR - number of dots in the right grid
//    * @param {Object} [args] - additional arguments.
//    * @param {int} [args.gridWidth=20] - number of squares in a row
//    * @param {int} [args.gridHeight=20] - number of squares in a column
//    * @param {int} [args.dotWidth=2] - pixel width of each dot
//    * @param {int} [args.dotHeight=2] - pixel height of each dot
//    * @param {int} [args.paddingX=6] - horizontal padding of the squares (pixels)
//    * @param {int} [args.paddingY=6] - vertical padding of the squares (pixels)
//    * @param {int} [args.spacing=26] - spacing between the boxes
//    */
//   constructor(nDotsL, nDotsR, args = {}) {
//     this.dotCountL = nDotsL;
//     this.dotCountR = nDotsR;
//     this.gridWidth = args.gridWidth || 20;
//     this.gridHeight = args.gridHeight || 20;
//     this.dotWidth = args.dotWidth || 2;
//     this.dotHeight = args.dotHeight || 2;
//     this.paddingX = args.paddingX || 6;
//     this.paddingY = args.paddingY || 6;
//     this.gridL = this.renewGrid(this.dotCountL);
//     this.gridR = this.renewGrid(this.dotCountR);
//     this.displayWidth = this.gridWidth * this.dotWidth + (this.gridWidth + 2) * this.paddingX;
//     this.displayHeight = this.gridHeight * this.dotHeight + (this.gridHeight + 2) * this.paddingY;
//     this.spacing = args.spacing || 26;
//
//     // style properties
//     this.style = {
//       gridBorderColor: '#ffffff',
//       gridBorderWidth: '3',
//       dotColor: '#ffffff',
//       dotLineWidth: '1'
//     };
//   };
//   /** Create a grid
//    * @param {int} dotCount - number of dots to place in the grid
//    * @returns {int[]} A matrix of 0s with *dotCount* 1s inserted
//    */
//   renewGrid(dotCount) {
//     let grid = [];
//     for (let i = 0; i < this.gridWidth; i++) {
//       let row = [];
//       for (let j = 0; j < this.gridHeight; j++) {
//         row.push(0);
//       }
//       grid.push(row);
//     }
//     grid = this.populateGrid(grid, dotCount);
//     return grid;
//   };
//
//   /** Populate a grid with dots
//    * @param {int[]} grid - grid to populate
//    * @param {int} dotCount - number of dots to populate *grid* with
//    * @returns {int[]} *grid* populated with *dotCount* dots (1s)
//    */
//   populateGrid(grid, dotCount) {
//     for (let i = 0; i < dotCount; i++) {
//       let x = Math.floor(Math.random() * this.gridWidth);
//       let y = Math.floor(Math.random() * this.gridHeight);
//       if (grid[x][y] === 1)
//         i--;
//       else
//         grid[x][y] = 1;
//     }
//     return grid;
//   };
//
//   /** Draw a grid onto an HTML canvas
//    * @param {int[]} grid - grid to draw
//    * @param {object} ctx - HTML canvas on which to draw
//    * @param {boolean} offset - if *true*, draw offset horizontally by *this.spacing*
//    */
//   drawGrid(grid, ctx, offset) {
//     let xMin = (offset) ? this.spacing + this.displayWidth : 0;
//     // Draw frame
//     ctx.beginPath();
//     ctx.lineWidth = this.style.gridBorderWidth;
//     ctx.strokeStyle = this.style.gridBorderColor;
//     ctx.rect(xMin, 0, this.displayWidth, this.displayHeight);
//     ctx.stroke();
//     // Draw dots
//     ctx.lineWidth = this.style.dotLineWidth;
//     ctx.fillStyle = this.style.dotColor;
//     for (let x = 0; x < this.gridWidth; x++) {
//       for (let y = 0; y < this.gridHeight; y++) {
//         if (grid[x][y] === 1) {
//           let startX = xMin + (x + 1) * this.paddingX + x * this.dotWidth;
//           let startY = (y + 1) * this.paddingY + y * this.dotHeight;
//           // alternating the color should prevent brightness being used as a proxy
//           //ctx.fillStyle = ctx.fillStyle==='#000000'? this.style.dotColor : '#000000';
//           ctx.fillRect(startX, startY, this.dotWidth, this.dotHeight);
//           ctx.stroke();
//         }
//       }
//     }
//   };
//
//   draw(canvasId) {
//     let canvas = document.getElementById(canvasId);
//     let ctx = canvas.getContext('2d');
//     this.drawGrid(this.gridL, ctx, false);
//     this.drawGrid(this.gridR, ctx, true);
//   };
// }



 /* info conditions helper function */
 function determineInfoTrials(array, n1, n2){
   // Find the indices of all elements containing 14
   let indices = array.map((elem, index) => elem[0] === 14 ? index : -1).filter(index => index !== -1);

   // Select n1 random indices from the list of indices
   let selectedIndices = [];
   for (let i = 0; i < n1; i++) {
     let index = indices[Math.floor(Math.random() * indices.length)];
     selectedIndices.push(index);
     indices.splice(indices.indexOf(index), 1); // remove the selected index from the list of indices to prevent duplicates
   }

   // Replace the elements at the selected indices with 100
   for (let index of selectedIndices) {
     array.splice(index, 1, [100, .1]);
   }

   // Select n2 random indices from the remaining list of indices
   selectedIndices = [];
   for (let i = 0; i < n2; i++) {
     let index = indices[Math.floor(Math.random() * indices.length)];
     selectedIndices.push(index);
     indices.splice(indices.indexOf(index), 1); // remove the selected index from the list of indices to prevent duplicates
   }

    // Replace the elements at the selected indices with 200
   for (let index of selectedIndices) {
     array.splice(index, 1, [200, .1]);
   }

    // Find the indices of all elements containing 8
   indices = array.map((elem, index) => elem[0] === 8 ? index : -1).filter(index => index !== -1);

    // Select n1 random indices from the list of indices
   selectedIndices = [];
   for (let i = 0; i < n1; i++) {
     let index = indices[Math.floor(Math.random() * indices.length)];
     selectedIndices.push(index);
     indices.splice(indices.indexOf(index), 1); // remove the selected index from the list of indices to prevent duplicates
   }

    // Replace the elements at the selected indices with 100
   for (let index of selectedIndices) {
     array.splice(index, 1, [100, .1]);
   }

    // Select n2 random indices from the remaining list of indices
   selectedIndices = [];
   for (let i = 0; i < n2; i++) {
     let index = indices[Math.floor(Math.random() * indices.length)];
     selectedIndices.push(index);
     indices.splice(indices.indexOf(index), 1); // remove the selected index from the list of indices to prevent duplicates
   }

    // Replace the elements at the selected indices with 200
   for (let index of selectedIndices) {
     array.splice(index, 1, [200, .1]);
   }

   // Find the indices of all elements containing 2
   indices = array.map((elem, index) => elem[0] === 2 ? index : -1).filter(index => index !== -1);

   // Select n1 random indices from the list of indices
   selectedIndices = [];
   for (let i = 0; i < n1; i++) {
     let index = indices[Math.floor(Math.random() * indices.length)];
     selectedIndices.push(index);
     indices.splice(indices.indexOf(index), 1); // remove the selected index from the list of indices to prevent duplicates
   }

   // Replace the elements at the selected indices with 100
   for (let index of selectedIndices) {
     array.splice(index, 1, [100, .1]);
   }

   // Select n2 random indices from the remaining list of indices
   selectedIndices = [];
   for (let i = 0; i < n2; i++) {
     let index = indices[Math.floor(Math.random() * indices.length)];
     selectedIndices.push(index);
     indices.splice(indices.indexOf(index), 1); // remove the selected index from the list of indices to prevent duplicates
   }

   // Replace the elements at the selected indices with 200
   for (let index of selectedIndices) {
     array.splice(index, 1, [200, .1]);
   }
   return array
 }



 /******************
 * BASIC FUNCTIONS
 *******************/

 /*random sequence of 0s and 1s where half the sequence is 0 and half is 1*/
 function myEvenLengthSequence(total_number) {
   var sequence = [];
   for (i=0; i<total_number/2; i++) {
     sequence[i] = 0;
   }
   for (i=total_number/2; i<total_number; i++) {
     sequence[i] = 1;
   }
   sequence = sequence.sort(() => Math.random() - 0.5);
   return sequence;
 }

 /* calculate standard deviation of array*/
 function getStandardDeviation (array) {
   const n = array.length;
   const mean = array.reduce((a, b) => a + b) / n;
   return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
 }

/*returns a random integer between the specified values. The value is no lower than min
(or the next integer greater than min if min isn't an integer), and is less than (but not equal to) max. (min is inclusive, max is exclusive) */
 function getRandomInt(min, max) {
   min = Math.ceil(min);
   max = Math.floor(max);
   return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
 }


 /* function for sampling from normal distribution with given min, max, and skew
 * Standard Normal variate using Box-Muller transform.*/
 function randn_bm(min, max, skew) {
   let u = 0, v = 0;
   while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
   while(v === 0) v = Math.random();
   let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

   num = num / 10.0 + 0.5; // Translate to 0 -> 1
   if (num > 1 || num < 0) return randn_bm(min, max, skew); // resample between 0 and 1 if out of range
   num = Math.pow(num, skew); // Skew
   num *= max - min; // Stretch to fill range
   num += min; // offset to min
   return num;
 }


 /* returns 0 if incorrect and certain, and 1 if correct and certain */
function reverseBrierScore(confidence, outcome) {
  if (outcome) {
    var o = 0;
  } else {
    var o = 1;
  }
  var f = confidence / 100;
  return (f - o)**2;
}

/* calculate the dot difference obtained on a log adaptive staircasing procedure */
function seeMoreStep(stepNumber, lastValue) {
  if (stepNumber >= 0 && stepNumber < 5) {
    return Math.E ** (Math.log(lastValue) + 0.4);
  } else if (stepNumber >= 5 && stepNumber < 10) {
    return Math.E ** (Math.log(lastValue) + 0.2);
  } else {
    return Math.E ** (Math.log(lastValue) + 0.1);
  }
}

/* calculates binomial coefficient */
function binomial(n, k) {
  if ((typeof n !== 'number') || (typeof k !== 'number'))
    return false;
  var coeff = 1;
  for (var x = n - k + 1; x <= n; x++) coeff *= x;
  for (x = 1; x <= k; x++) coeff /= x;
  return coeff;
}

/* calculate RT to a certain number of decimal points */
function calculateRT(start, end) {
  start = parseFloat(start);
  end = parseFloat(end);
  var rt = end - start;
  return rt;
}

function checkCookie(cname) {
  var user = getCookie(cname);
  if (user != "") {
    alert("Welcome again " + user);
  } else {
    user = prompt("Please enter your name:", "");
    if (user != "" && user != null) {
      setCookie("username", user, 365);
    }
  }
}

/* check if something contains something else */
function contains(array, object) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] == object) {
      return true;
    }
  }
  return false;
}

/* checks how many of something is in something else */
function containsN(array, object) {
  var count = 0;
  for (var i = 0; i < array.length; i++) {
    if (array[i] == object) {
      count++;
    }
  }
  return count;
}

/* checks if one array contains another array */
function containsArray(needle, haystack) {
  for (var i = 0; i < needle.length; i++) {
    if (haystack.indexOf(needle[i]) === -1)
      return false;
  }
  return true;
}

/* create an element in the DOM */
function createGeneral(name, parent, type, classNames, idName, innerHTML) {
  var name = parent.appendChild(document.createElement(type));
  if (classNames !== undefined) {
    name.setAttribute('class', classNames);
  }
  if (idName !== undefined) {
    name.setAttribute('id', idName);
  }
  name.innerHTML = innerHTML;
  return name;
}

/* calculates the cumulative offset from the top of a HTML document */
function cumulativeOffset(element) {
  var top = 0, left = 0;
  do {
    top += element.offsetTop || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent;
  } while (element);

  return {
    top: top,
    left: left
  };
}

/* calculates factorial*/
function factorial(num) {
  var rval = 1;
  for (var i = 2; i <= num; i++)
    rval = rval * i;
  return rval;
}

/* random identifier generator */
function genRandIdentifier(length) {
  var randomNumber = Math.round(Math.random() * Math.pow(10, length));
  var r = '' + randomNumber;
  while (r.length < length) {
    r = '0' + r;
  }
  var identifier = cohort + r;
  return identifier;
}

/* retrieve a cookie */
function getCookie(cname) {
  var name = cname + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

/* get URL components */
function getUrlVars() {
  var vars = {};
  var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
    vars[key] = value;
  });
  return vars;
}

/* detects if an element is in the viewport */
function isScrolledIntoView(elem) {
  var docViewTop = $(window).scrollTop();
  var docViewBottom = docViewTop + $(window).height();
  var elemTop = $(elem).offset().top;
  var elemBottom = elemTop + $(elem).height();
  return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

/* returns the longform string version of the date */
function longformDate() {
  var currentDate = new Date();
  return currentDate.toTimeString();
}

/* calculate average for an array */
function mean(array) {
  var total = 0;
  for (var i = 0; i < array.length; i++) {
    total += array[i];
  }
  var avg = total / array.length;
  return avg;
}

/* calculates minutes and seconds from milliseconds */
function msToMinSec(ms) {
  var min = ms / 1000 / 60;
  var r = min % 1;
  var sec = Math.floor(r * 60);
  if (sec < 10) {
    sec = '0'+sec;
  }
  min = Math.floor(min);
  return (min + ':' + sec);
}

function nCr(n, r) {
  return factorial(n)/(factorial(r) * factorial(n-r));
}

/* calculates P(correct) */
function getPCorrect(tiles_seen, chosen_tiles_seen) {

  var prob = 0;
  var z = 25 - tiles_seen;
  var k = 13 - chosen_tiles_seen;
  if (k < 0) {
    k = 0;
  }

  if (k <= z) {
    while (k <= z) {
      prob += nCr(z, k);
      k++;
    }
    prob = prob/(2 ** z);

  } else {
    prob = 1;
  }
  return prob;
}

/* generates random integers at specified intervals */
function randIntGen(intervalsArray) {
  var outputArray = [];
  for (var i = 0; i < intervalsArray.length; i++) {
    var randomisedArray = shuffle(intervalsArray[i]);
    outputArray.push(randomisedArray[0]);
  }
  return outputArray;
}



function replaceRandInts(array, toReplace, replaceWith){
  const indices = [];
  for (let i = 0; i < array.length; i++) {
    if (array[i][0] === toReplace) {
      indices.push(i);
    }
  }

  shuffle(indices);

  for (let i = 0; i < 2; i++) {
    array[indices[i]][0] = replaceWith[0];
  }

  for (let i = 2; i < 4; i++) {
    array[indices[i]][0] = replaceWith[1];
  }

}


 /* remove hash from URL without reloading the page */
function removeHash() {
  var scrollV, scrollH, loc = window.location;
  if ("pushState" in history) {
    history.pushState("", document.title, loc.pathname + loc.search);
   } else {
    // Prevent scrolling by storing the page's current scroll offset
    scrollV = document.body.scrollTop;
    scrollH = document.body.scrollLeft;

    loc.hash = "";

    // Restore the scroll offset, should be flicker free
    document.body.scrollTop = scrollV;
    document.body.scrollLeft = scrollH;
  }
}

/* remove the query string */
function removeQueryString() {
  var url = window.location.href;
  if (url.indexOf("?") > 0) {
    var updatedUri = url.substring(0, url.indexOf("?"));
    window.history.replaceState({}, document.title, updatedUri);
  }
}

/* returns a minimum value */
function returnMinimum(value, minimum_value) {
  if (value >= minimum_value) {
    return value;
  } else {
    return minimum_value;
  }
}

/* rounds to a specified number of decimal places */
function round(value, decimals) {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

/* set a cookie */
function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  var expires = "expires=" + d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

/* scroll to top of a page when page finishes loading. requires jQuery */
function scrollTop() {
  $(document).ready(function () {
    $(this).scrollTop(0);
  });
}

/* Fisher-Yates random shuffle */
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;
  while (0 !== currentIndex) {
    // pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    // and swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
}



 /***********************
 * COMPOSITE FUNCTIONS
 ************************/

/* jQuery-powered -- create a survey matrix with the number of questions as the number of rows and the number of options as the number of columns. num is just a numerical index to identify this specific element in case others of this type exist in the page. requires createGeneral() and jQuery */
function createSurveyMatrix(parent, id, questionnaireName, questions, options) {

  for (var row = 0; row < questions.length; row++) {
    // create a row of SurveyMatrix
    var surveyMatrix_row = createGeneral(
      surveyMatrix_row,
      parent,
      'div',
      'surveyMatrix-row',
      id + '-surveyMatrix-row' + row,
      ''
    );
    // create the question area for that row
    var surveyMatrix_question = createGeneral(
      surveyMatrix_question,
      surveyMatrix_row,
      'div',
      'surveyMatrix-question',
      id + '-surveyMatrix-row' + row + '-question',
      questions[row]
    );
    // create the option area for that row
    var surveyMatrix_optionArea = createGeneral(
      surveyMatrix_optionArea,
      surveyMatrix_row,
      'div',
      'surveyMatrix-optionArea',
      id + '-surveyMatrix-row' + row + '-optionArea',
      ''
    );
    // for each row in SurveyMatrix:
    for (var column = 0; column < options.length; column++) {
      // create an option in its own column
      var surveyMatrix_option = createGeneral(
        surveyMatrix_question,
        surveyMatrix_optionArea,
        'div',
        'surveyMatrix-option',
        id + '-surveyMatrix-row' + row + '-option' + column,
        ''
      );
      // create a default radio input
      var surveyMatrix_defaultRadio = createGeneral(
        surveyMatrix_defaultRadio,
        surveyMatrix_option,
        'input',
        'surveyMatrix-defaultRadio',
        id + '-surveyMatrix-row' + row + '-defaultRadio' + column,
        ''
      );
      surveyMatrix_defaultRadio.setAttribute('type', 'radio');
      surveyMatrix_defaultRadio.setAttribute('name', questionnaireName + '_' + id + '-' + row);
      surveyMatrix_defaultRadio.setAttribute('value', options[column]);
      // create a custom radio input for overlay
      var surveyMatrix_customRadio = createGeneral(
        surveyMatrix_customRadio,
        surveyMatrix_option,
        'div',
        'surveyMatrix-customRadio',
        id + '-surveyMatrix-row' + row + '-customRadio' + column,
        ''
      );
      var surveyMatrix_optionLabel = createGeneral(
        surveyMatrix_optionLabel,
        surveyMatrix_option,
        'label',
        'surveyMatrix-optionLabel',
        id + '-surveyMatrix-row' + row + '-optionLabel' + column,
        options[column],
        ''
      );
      surveyMatrix_optionLabel.setAttribute('for', questionnaireName + '_' + id + '-' + row);
    }
  }
  // use jQuery to make sure that the custom radio causes the default radio value to change
  $('.surveyMatrix-option').bind('click', function (event) {
    // when clicking on an option area, if contained radio button is not checked, render it checked
    if ($(event.currentTarget).children('input').prop('checked') == false) {
      $(event.currentTarget).children('input').prop('checked', 'true');
    }
  });
}

/* jQuery-powered -- creates a confidence slider - hover & scroll versions */
function noDragSlider(name, parent, tooltipLabels, endLabels, buttonLabels) {
  var noDragSlider = createGeneral(
    noDragSlider,
    parent,
    'div',
    'noDragSlider ' + name,
    'noDragSlider ' + name,
    ''
  );
  var tooltipTop = createGeneral(
    tooltipTop,
    noDragSlider,
    'div',
    'noDragSlider tooltip-row tooltip-top ' + name,
    'tooltip-row-top',
    ''
  );
  var tooltipText1 = createGeneral(
    tooltipText1,
    tooltipTop,
    'div',
    'tooltip tooltip-top tooltip-left tooltip-1 ' + name,
    'tooltip-1',
    tooltipLabels[0]
  );
  var tooltipText2 = createGeneral(
    tooltipText2,
    tooltipTop,
    'div',
    'tooltip tooltip-top tooltip-left tooltip-2 ' + name,
    'tooltip-2',
    tooltipLabels[1]
  );
  var tooltipText3 = createGeneral(
    tooltipText3,
    tooltipTop,
    'div',
    'tooltip tooltip-top tooltip-right tooltip-3 ' + name,
    'tooltip-3',
    tooltipLabels[2]
  );
  var tooltipText4 = createGeneral(
    tooltipText4,
    tooltipTop,
    'div',
    'tooltip tooltip-top tooltip-right tooltip-4 ' + name,
    'tooltip-4',
    tooltipLabels[3]
  );
  var tooltipArrowTop = createGeneral(
    tooltipArrowTop,
    noDragSlider,
    'div',
    'tooltip-arrowArea arrow-top ' + name,
    'tooltip-arrow-top',
    ''
  );
  var tooltipArrowTop1 = createGeneral(
    tooltipArrowTop1,
    tooltipArrowTop,
    'div',
    'arrow arrow-down arrow-left arrow-1 ' + name,
    'arrow-1',
    ''
  );
  var tooltipArrowTop2 = createGeneral(
    tooltipArrowTop2,
    tooltipArrowTop,
    'div',
    'arrow arrow-down arrow-left arrow-2 ' + name,
    'arrow-2',
    ''
  );
  var tooltipArrowTop3 = createGeneral(
    tooltipArrowTop3,
    tooltipArrowTop,
    'div',
    'arrow arrow-down arrow-right arrow-3 ' + name,
    'arrow-3',
    ''
  );
  var tooltipArrowTop4 = createGeneral(
    tooltipArrowTop4,
    tooltipArrowTop,
    'div',
    'arrow arrow-down arrow-right arrow-4 ' + name,
    'arrow-4',
    ''
  );
  var scaleRow = createGeneral(
    scaleRow,
    noDragSlider,
    'div',
    'scale-row ' + name,
    'scale-row',
    ''
  );
  var labelLeft = createGeneral(
    labelLeft,
    scaleRow,
    'div',
    'overlay-label ' + name,
    'overlay-label-left',
    endLabels[0]
  );
  var scale = createGeneral(
    scale,
    scaleRow,
    'div',
    'scale ' + name,
    'scale',
    ''
  );
  var labelRight = createGeneral(
    labelRight,
    scaleRow,
    'div',
    'overlay-label ' + name,
    'overlay-label-right',
    endLabels[1]
  );
  var scaleLeft = createGeneral(
    scaleLeft,
    scale,
    'div',
    'scale-content scale-left ' + name,
    'scale-left',
    ''
  );
  var scaleRight = createGeneral(
    scaleRight,
    scale,
    'div',
    'scale-content scale-right ' + name,
    'scale-right',
    ''
  );
  var scaleLeftFill = createGeneral(
    scaleLeftFill,
    scaleLeft,
    'div',
    'scale-content scale-left scale-fill ' + name,
    'scale-left-fill',
    '',
  );

  var scaleRightFill = createGeneral(
    scaleRightFill,
    scaleRight,
    'div',
    'scale-content scale-right scale-fill ' + name,
    'scale-right-fill',
    ''
  );
  var tooltipBottom = createGeneral(
    tooltipBottom,
    noDragSlider,
    'div',
    'tooltip-row tooltip-bottom ' + name,
    'tooltip-row-bottom',
    ''
  );
  if (buttonLabels.escape != undefined) {
    var escapeButton = createGeneral(
      escapeButton,
      tooltipBottom,
      'div',
      'scale-button escape-button invisible ' + name,
      'escape-button',
      buttonLabels.escape
    );
  }

  if (buttonLabels.moreInfo != undefined) {
    var moreInfoButton = createGeneral(
      moreInfoButton,
      tooltipBottom,
      'div',
      'scale-button more-button invisible ' + name,
      'more-button',
      buttonLabels.moreInfo
    );
  }
  if (buttonLabels.submit != undefined) {
    var submitButton = createGeneral(
      submitButton,
      tooltipBottom,
      'div',
      'scale-button submit-button invisible ' + name,
      'submit-button',
      buttonLabels.submit
    );
  }

  var rightConfidenceValue = createGeneral(
    rightConfidenceValue,
    scaleRightFill,
    'div',
    'scale-value ' + name,
    'confidence-value-right',
    ''
  );
  var leftConfidenceValue = createGeneral(
    leftConfidenceValue,
    scaleLeftFill,
    'div',
    'scale-value ' + name,
    'confidence-value-left',
    ''
  );

  /* $('#noDragSlider').bind('mousewheel', function (event) {
    var getConfidence = confidenceCounter - event.deltaY;
    updateConfidence(getConfidence);
  });
  return; */

  // add option for registering touch events (currently faulty)
  /* $('#noDragSlider').bind('touchstart', function (event) {
    ts = event.originalEvent.touches[0].clientY;
  });

  $('#noDragSlider').bind('touchmove', function (event) {
    var te = event.originalEvent.changedTouches[0].clientY;
    var tChange = Math.floor((te - ts) / 300); // adjust touch sensitivity by changing the divisor
    var getConfidence = confidenceCounter - tChange;
    updateConfidence(getConfidence);
  }); */
}

/* alternate version of SurveyMatrix in which each option can be set with a different label*/
function createSurveyMatrix2(parent, id, questionnaireName, questions, options) {

  for (var row = 0; row < questions.length; row++) {
    // create a row of SurveyMatrix
    var surveyMatrix_row = createGeneral(
      surveyMatrix_row,
      parent,
      'div',
      'surveyMatrix-row',
      id + '-surveyMatrix-row' + row,
      ''
    );
    // create the question area for that row
    var surveyMatrix_question = createGeneral(
      surveyMatrix_question,
      surveyMatrix_row,
      'div',
      'surveyMatrix-question',
      id + '-surveyMatrix-row' + row + '-question',
      questions[row]
    );
    // create the option area for that row
    var surveyMatrix_optionArea = createGeneral(
      surveyMatrix_optionArea,
      surveyMatrix_row,
      'div',
      'surveyMatrix-optionArea',
      id + '-surveyMatrix-row' + row + '-optionArea',
      ''
    );
    // for each row in SurveyMatrix:
    for (var column = 0; column < options.length; column++) {
      // create an option in its own column
      var surveyMatrix_option = createGeneral(
        surveyMatrix_question,
        surveyMatrix_optionArea,
        'div',
        'surveyMatrix-option',
        id + '-surveyMatrix-row' + row + '-option' + column,
        ''
      );
      // create a default radio input
      var surveyMatrix_defaultRadio = createGeneral(
        surveyMatrix_defaultRadio,
        surveyMatrix_option,
        'input',
        'surveyMatrix-defaultRadio',
        id + '-surveyMatrix-row' + row + '-defaultRadio' + column,
        ''
      );
      surveyMatrix_defaultRadio.setAttribute('type', 'radio');
      surveyMatrix_defaultRadio.setAttribute('name', questionnaireName + '_' + id + '-' + row);
      surveyMatrix_defaultRadio.setAttribute('value', options[row][column]);
      // create a custom radio input for overlay
      var surveyMatrix_customRadio = createGeneral(
        surveyMatrix_customRadio,
        surveyMatrix_option,
        'div',
        'surveyMatrix-customRadio',
        id + '-surveyMatrix-row' + row + '-customRadio' + column,
        ''
      );
      var surveyMatrix_optionLabel = createGeneral(
        surveyMatrix_optionLabel,
        surveyMatrix_option,
        'label',
        'surveyMatrix-optionLabel',
        id + '-surveyMatrix-row' + row + '-optionLabel' + column,
        options[column],
        ''
      );
      surveyMatrix_optionLabel.setAttribute('for', questionnaireName + '_' + id + '-' + row);
    }
  }
  // use jQuery to make sure that the custom radio causes the default radio value to change
  $('.surveyMatrix-option').bind('click', function (event) {
    // when clicking on an option area, if contained radio button is not checked, render it checked
    if ($(event.currentTarget).children('input').prop('checked') == false) {
      $(event.currentTarget).children('input').prop('checked', 'true');
    }
  });
}

/* deconstructing 5x5 matrix loading icon. activatedSquares refers to the specific mini-squares that are activated within the icon, in case you want a smaller/less complicated version of the loading icon. requires createGeneral() */
function ISTloading(parent, activatedSquares, colorsArray) {
  // create the loading animation
  var loader = createGeneral(
    loader,
    parent,
    'div',
    'sk-cube-grid',
    'loader',
    ''
  );

  for (i = 0; i < activatedSquares.length; i++) {
    var loadingComponent = createGeneral(
      loadingComponent,
      loader,
      'div',
      'sk-cube sk-cube' + activatedSquares[i],
      'loader-component-' + activatedSquares[i],
      ''
    );
  }

  // cycle through the colours list in the loading animation
  var index = 0;
  setInterval(function () {
    index = (index + 1) % colorsArray.length;
    var colour = colorsArray[index];
    document.body.style.setProperty('--randomColor', colour);
  }, 1500);
}

/* animated two-way scrolling icon. id is just a numerical index to identify this specific element in case others of this type exist in the page. requires createGeneral() */
function scrollIndicator(parent, id, captionEnabled) {
  var scrollIndicator = createGeneral(
    scrollIndicator,
    parent,
    'div',
    'scrollIndicator',
    'scrollIndicator' + id,
    ''
  );
  if (captionEnabled) {
    var scrollCaption = createGeneral(
      scrollCaption,
      scrollIndicator,
      'span',
      'scrollIndicator-caption',
      'scrollIndicator-caption',
      'SCROLL ENABLED'
    )
  }
  var indicator_arrows = createGeneral(
    indicator_arrows,
    scrollIndicator,
    'div',
    'scrollIndicator-arrowArea doubleArrow',
    '',
    ''
  )
  for (i = 2; i > 0; i--) {
    var indicator_arrow = createGeneral(
      indicator_arrow,
      indicator_arrows,
      'span',
      'scrollIndicator-arrow arrow-up arrow' + i,
      'scrollIndicator' + id + '-arrow' + i,
      ''
    );
  }
  var indicator_mouse = createGeneral(
    indicator_mouse,
    scrollIndicator,
    'div',
    'scrollIndicator-mouse',
    'scrollIndicator' + id + '-mouse',
    ''
  );

  var indicator_wheel = createGeneral(
    indicator_wheel,
    indicator_mouse,
    'div',
    'scrollIndicator-wheel wheelbobble',
    'scrollIndicator' + id + '-wheel',
    ''
  );

  var indicator_arrows2 = createGeneral(
    indicator_arrows2,
    scrollIndicator,
    'div',
    'scrollIndicator-arrowArea doubleArrow',
    '',
    ''
  )

  for (i = 1; i < 3; i++) {
    var indicator_arrow2 = createGeneral(
      indicator_arrow2,
      indicator_arrows2,
      'span',
      'scrollIndicator-arrow arrow-down arrow' + i,
      'scrollIndicator' + id + '-arrow' + i,
      ''
    );
  }
}

/* animated scrolling down icon. id is just a numerical index to identify this specific element in case others of this type exist in the page. requires createGeneral() */
function scrolldownIndicator(parent, id, captionEnabled) {

  var scrollIndicator = createGeneral(
    scrollIndicator,
    parent,
    'div',
    'scrollIndicator',
    'scrollIndicator' + id,
    ''
  );

  if (captionEnabled) {
    var scrollCaption = createGeneral(
      scrollCaption,
      scrollIndicator,
      'span',
      'scrollIndicator-caption',
      'scrollIndicator-caption',
      'SCROLL ENABLED'
    )
  }

  var indicator_mouse = createGeneral(
    indicator_mouse,
    scrollIndicator,
    'div',
    'scrollIndicator-mouse',
    'scrollIndicator' + id + '-mouse',
    ''
  );

  var indicator_wheel = createGeneral(
    indicator_wheel,
    indicator_mouse,
    'div',
    'scrollIndicator-wheel wheeldown',
    'scrollIndicator' + id + '-wheel',
    ''
  );

  var indicator_arrows = createGeneral(
    indicator_arrows,
    scrollIndicator,
    'div',
    'scrollIndicator-arrowArea tripleArrow',
    '',
    ''
  )

  for (i = 1; i < 4; i++) {
    var indicator_arrow = createGeneral(
      indicator_arrow,
      indicator_arrows,
      'span',
      'scrollIndicator-arrow arrow-down arrow' + i,
      'scrollIndicator' + id + '-arrow' + i,
      ''
    );
  }
}

/* animated scrolling up icon. id is just a iderical index to identify this specific element in case others of this type exist in the page. requires createGeneral() */
function scrollupIndicator(parent, id, captionEnabled) {
  var scrollIndicator = createGeneral(
    scrollIndicator,
    parent,
    'div',
    'scrollIndicator',
    'scrollIndicator' + id,
    ''
  );
  if (captionEnabled) {
    var scrollCaption = createGeneral(
      scrollCaption,
      scrollIndicator,
      'span',
      'scrollIndicator-caption',
      'scrollIndicator-caption',
      'SCROLL ENABLED'
    )
  }
  var indicator_arrows = createGeneral(
    indicator_arrows,
    scrollIndicator,
    'div',
    'scrollIndicator-arrowArea tripleArrow',
    '',
    ''
  )
  for (i = 3; i > 0; i--) {
    var indicator_arrow = createGeneral(
      indicator_arrow,
      indicator_arrows,
      'span',
      'scrollIndicator-arrow arrow-up arrow' + i,
      'scrollIndicator' + id + '-arrow' + i,
      ''
    );
  }
  var indicator_mouse = createGeneral(
    indicator_mouse,
    scrollIndicator,
    'div',
    'scrollIndicator-mouse',
    'scrollIndicator' + id + '-mouse',
    ''
  );

  var indicator_wheel = createGeneral(
    indicator_wheel,
    indicator_mouse,
    'div',
    'scrollIndicator-wheel wheelup',
    'scrollIndicator' + id + '-wheel',
    ''
  );
}


// SVG countdown timer //
function countdownTimer(parent, number, duration) {

  var countdownContainer = createGeneral(
    countdownContainer,
    parent,
    'div',
    '',
    'countdown',
    ''
  );

  var countdownNumberEl = createGeneral(
    countdownNumberEl,
    countdownContainer,
    'div',
    '',
    'countdown-number',
    ''
  );

  var countdownSVG = createGeneral(
    countdownSVG,
    countdownContainer,
    'svg',
    '',
    '',
    '<circle r="18" cx="20" cy="20"></circle>'
  );

  countdownNumberEl = document.getElementById('countdown-number');
  var countdown = number;

  countdownNumberEl.textContent = countdown;

  setInterval(function () {
    countdown = --countdown <= 0 ? number : countdown;
    countdownNumberEl.textContent = countdown;
  }, duration);
}


 //data to csv format and download csv
 function toCsv(input) {
  let newInput = input.map(row => {
    return [row[0], row[1].join('|')];
  });
   return newInput.map(row => row.join('|')).join('\n')
 }

 function saveData(name, data) {
   data = toCsv(data);
   var xhr = new XMLHttpRequest();
   xhr.open('POST', 'save-data.php');
   xhr.setRequestHeader('Content-Type', 'application/json');
   xhr.send(JSON.stringify({filename: name, filedata: data}));
 }

// save data in csv format
 function saveCSV(ID, attempts) {
   // convert dataObject to CSV format
   // convert DataObject into an array where first entry is the object key
   var entries = Object.entries(dataObject);

   //list of no of trials in each block
   const trialsInBlock = [];
   // for loop to find number of trials in block
   for (const entry of entries) {
     if (typeof entry[1] === "object" && entry[1].length) {
       if (typeof entry[1][0] === "object" && entry[1][0].length) {
         for (const subentry of entry[1]) {
           trialsInBlock.push(subentry.length);
         }
         break;
       }
     }
   }
   // expand shorter block lists to trial length
   // non-objects, lists of non-objects, lists of lists
   for (let i=0; i < entries.length; i++) {
     const entry = entries[i];
     if (typeof entry[1] != "object") {
       // turn into list
       const x = [];
       var y = entry[1];
       for(let b = 0; b < trialsInBlock.length; b++)
         for(let t = 0; t < trialsInBlock[b]; t++)
           x.push(y);
       entries[i][1] = x;
     } else {
       // list of lists
       if (typeof entry[1][0] == "object") {
         const x = [];
       for(let b = 0; b < trialsInBlock.length; b++)
         for(let t = 0; t < trialsInBlock[b]; t++)
           x.push(entry[1][b][t]);
       entries[i][1] = x;
       // list
       } else {
         const x = [];
         for(let b = 0; b < trialsInBlock.length; b++)
           for(let t = 0; t < trialsInBlock[b]; t++)
             x.push(entry[1][b]);
         entries[i][1] = x;
       }
     }
   }
   saveData("data_" + ID + attempts, entries)
 }

