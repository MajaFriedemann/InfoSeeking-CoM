/**
 * @function drawSquircles()
 * @param {Object} parent - parent div
 * @param {string} canvasID - ID for the canvas object
 * @param {int} canvasWidth
 * @param {int} canvasHeight
 * @param {Object} squircleStaircase
 * @param {string} upperColor - colour for the right side of the scale
 * @param {string} lowerColor - colour for the left side of the scale
 * @param {Array} tooltipLabels
 * @param {Array} endLabels
 * @param {int} waitTimeLimit - maximum wait time
 * @param {int} fixationPeriod
 * @param {int} stimulusPeriod
 * @param {int} transitionPeriod
 * @param {int} trialCount
 * @param {int} trialCounterVariable
 * @param {Object} trialDataVariable
 * @param {Object} permanentDataVariable
 * @param {boolean} isTutorialMode
 * @param {int} accuracyThreshold
 * @param {boolean} redButtonEnabled
 * @param {string} redButtonName
 * @param {boolean} yellowButtonEnabled
 * @param {string} yellowButtonName
 * @param {boolean} greenButtonEnabled
 * @param {string} greenButtonName
 * @param {string} condition
 * @param {string} betterColor
 */

function drawSquircles(parent, canvasID, canvasWidth, canvasHeight, squircleStaircase, upperColor, lowerColor, tooltipLabels, endLabels,  waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, condition, betterColor) {

    //default variables
    var backendConfidence = 50;
    var correctResponse;
    var sliderActive = true;
    var displayedConfidence = 0;
    var secondTimeAround = false;  // set to true when more info is sought and the stimuli are shown a second time
    var start_timer;
    var confidences;
    var secondConfidences;
    var RTs = [];
    var points = [];
    var choice_timer;
    var confidence_timer;
    var forcedSeeMore = false;
    var forcedSeeMoreTemp = false;
    var forcedContinue = false;

    // prevent context menu from opening on right click
    document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
    }, false);


    // disable the cursor
    $('.jspsych-content').css('cursor', 'none');

    // determine the cost condition
    com_cost = cost_conditions[totalTrials];

    // determine the parameters for the squircles
    var total_circles = 8;
    var radius = 60;

    var color_sd = color_conditions[totalTrials][1];
    var color_mean_level_dif = color_conditions[totalTrials][0];

    if (isTutorialMode && condition !=="practice2") {
        difference = 0.0001*squircleStaircase.getLast('logSpace'); // difference is only updated when in practice mode and thereafter just kept constant
        if (difference > 0.01) {
            difference = 0.01; // at 0.01 the colour scale is maxed out with 0.5-50.*0.01=0 or 0.5+50*0.01=1
        }
    }


    //var difference = .05; //staircase 70% accuracy for 3*difference
    var color_means_a = [0.5];
    var color_means_b = [0.5];
    for (var n=1; n<50; n++){
        color_means_a[n]=color_means_a[n-1]+difference;
        color_means_b[n]=color_means_b[n-1]-difference;
    }
    color_means_b.reverse();
    var color_means = color_means_b.concat(color_means_a);

    var color_mean_level = randInt(5, (color_means.length-6)); // not taking the extremes to allow for variance even when the colour scale is maxed out
    var color_mean_two_level;

    if (color_mean_level >= (color_means.length/2)) {
        color_mean_two_level = color_mean_level - color_mean_level_dif;
    } else if (color_mean_level < (color_means.length/2)) {
        color_mean_two_level = color_mean_level + color_mean_level_dif;
    }

    var color_mean = color_means[color_mean_level];
    var color_mean_two = color_means[color_mean_two_level];


    var moreRedSide;
    var randomiser = Math.random();
    if (randomiser > 0.5) {
        moreRedSide = 'left';
    } else {
        moreRedSide = 'right';
    }

    console.log('color mean one: '+color_mean);
    console.log('color mean one level: '+color_mean_level);
    console.log('color mean two: '+color_mean_two);
    console.log('color mean two level: '+color_mean_two_level);
    console.log('color sd: '+color_sd);
    console.log('more red side '+moreRedSide);

    //draw the squircle stimuli
    let stimuli = drawSquircleStimuli(parent, canvasID, canvasWidth, canvasHeight, total_circles, radius,
        color_mean, color_sd, color_mean_two, moreRedSide);
    leftStimulus = stimuli[0];
    rightStimulus = stimuli[1];

    if (isTutorialMode === false) {
        //catch trials (5% of trials (1% is lost below))
        var catchRandomiser = Math.random();
        if (catchRandomiser > 0.94) {
            forcedContinue = true;
            yellowButtonEnabled = false;
        }
        //forced see more trials (15% of trials)
        var forcedRandomiser = Math.random();
        if (forcedRandomiser > 0.84) {
            forcedSeeMore = true;
            forcedSeeMoreTemp = true;
        }
        //ensure that it doesnt happen that there is no button at all (loosing 1%)
        if (yellowButtonEnabled === false && forcedSeeMoreTemp === true) {
            yellowButtonEnabled = true;
            forcedSeeMore = false;
            forcedSeeMoreTemp = false;
            forcedContinue = false;
        }
    }

    var buttonsToShow = {};
    if (redButtonEnabled) {
        buttonsToShow['escape'] = redButtonName;
    }
    if (yellowButtonEnabled) {
        buttonsToShow['moreInfo'] = yellowButtonName;
    }
    if (greenButtonEnabled) {
        buttonsToShow['submit'] = greenButtonName;
    }

    // draw the slider
    var response_area = createGeneral(
        response_area,
        parent,
        'div',
        'response-area',
        'response-area',
        ''
    );

    //draw the confidence slider
    var confidence_meter = noDragSlider('slider', response_area, tooltipLabels, endLabels, buttonsToShow);
    var middleMarker = createGeneral(
        middleMarker,
        document.getElementById('scale'),
        'div',
        '',
        'middleMarker',
        ''
    );

    //draw the confidence question
    if (betterColor === "red") {
        var confidence_question = createGeneral(
            confidence_question,
            response_area,
            'div',
            'confidence-question',
            'confidence-question',
            '<h1 style="color: rgb(255,0,0)">Which side was more red?</h1>'
        );
    } else {
        var confidence_question = createGeneral(
            confidence_question,
            response_area,
            'div',
            'confidence-question',
            'confidence-question',
            '<h1 style="color: rgb(0,100,255)">Which side was more blue?</h1>'
        );
    }
    if (condition === "value-value") {
        document.getElementById('confidence-question').innerHTML = '<h1>Which circle do you pick?</h1>';
    }


    //hide the response area
    $('.response-area').css('visibility', 'hidden');


    //if we are not in tutorial mode, we cover half the stimuli
    if (isTutorialMode===false || condition === "practice2") {

        var coverCanvas = document.createElement('canvas');
        div = document.getElementById("jspsych-canvas-sliders-response-stimulus");
        coverCanvas.id     = "coverCanvas";
        coverCanvas.width  = canvasWidth;
        coverCanvas.height = canvasHeight;
        coverCanvas.style.position = "absolute";
        div.appendChild(coverCanvas);

        var ctx = coverCanvas.getContext("2d");

        ctx.fillStyle = "black";

        var cy = coverCanvas.height/2;
        var cxl = coverCanvas.width / 2 - coverCanvas.width / 3;
        var cxr = coverCanvas.width / 2 + coverCanvas.width / 3;

        /*draw the left cover*/
        leftStimulusHalf = [];
        var sequence = myEvenLengthSequence(total_circles);
        for (i = 0; i < total_circles; i++) {
            if (sequence[i] === 1) {
                var angle = i * 2 * Math.PI / total_circles;
                var xl = cxl + Math.cos(angle) * radius;
                var y = cy + Math.sin(angle) * radius;
                ctx.beginPath();
                ctx.arc(xl, y, 21 - 0.5 * total_circles, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
            } else {
                leftStimulusHalf.push(leftStimulus[i]);
            }
        }

        /*draw the right cover*/
        rightStimulusHalf = [];
        var sequence = myEvenLengthSequence(total_circles);
        for (i = 0; i < total_circles; i++) {
            if (sequence[i] === 1) {
                var angle = i * 2 * Math.PI / total_circles;
                var xr = cxr + Math.cos(angle) * radius;
                var y = cy + Math.sin(angle) * radius;
                ctx.beginPath();
                ctx.arc(xr, y, 21 - 0.5 * total_circles, 0, Math.PI * 2, true);
                ctx.closePath();
                ctx.fill();
            } else {
                rightStimulusHalf.push(rightStimulus[i]);
            }
        }
    }


    //draw the stimulus masks
    setTimeout(function () {
        var mask1 = createGeneral(
            mask1,
            document.getElementById('jspsych-canvas-sliders-response-stimulus'),
            'div',
            'grid-mask mask-left',
            'grid-mask-left',
            ''
        );

        var mask2 = createGeneral(
            mask2,
            document.getElementById('jspsych-canvas-sliders-response-stimulus'),
            'div',
            'grid-mask mask-right',
            'grid-mask-right',
            ''
        );

        $('.grid-mask').css('visibility', 'visible');

        if (isTutorialMode === false || condition === "practice2") {
            //hide the stimulus covers (so they are not there the second time around)
            var coverCanvas = document.getElementById("coverCanvas");
            var ctx = coverCanvas.getContext("2d");
            ctx.clearRect(0, 0, coverCanvas.width, coverCanvas.height);
        }
        //$('.grid-cover').css('visibility', 'hidden');

        // reset the event loggers
        $('.mask-left').off('click');
        $('.mask-right').off('click');
        $('.escape-button').off('click');
        $('.submit-button').off('click');
        $('.more-button').off('click');
        $('.scale-row').off('mousemove').off('click');


        //show the response area
        setTimeout(function () {
            $('.confidence-question').css('visibility', 'visible');
            $('.response-area').css('visibility', 'visible');
            $('.jspsych-content').css('cursor', 'auto');

            //enable the cursor
            $('.jspsych-content').css('cursor', 'auto');

            // start the trial timer
            start_timer = Date.now();
        }, transitionPeriod);


        function recordRating(backendConfidence, moreRedSide, type, betterColor) {
            if (backendConfidence !== undefined) {
                var invertedConfidence = 100 - backendConfidence;
                var confidence;
                // record correct/incorrect confidence
                if (secondTimeAround === true) {
                    if (moreRedSide === 'left') {
                        if (betterColor === "red") {
                            secondConfidences = invertedConfidence;
                            confidence = invertedConfidence;
                        } else if (betterColor === "blue") {
                            secondConfidences = backendConfidence;
                            confidence = backendConfidence;
                        }
                    } else if (moreRedSide === "right") {
                        if (betterColor === "red") {
                            secondConfidences = backendConfidence;
                            confidence = backendConfidence;
                        } else {
                            secondConfidences = invertedConfidence;
                            confidence = invertedConfidence;
                        }
                    }

                } else {
                    if (moreRedSide === 'left') {
                        if (betterColor === "red") {
                            confidences = invertedConfidence;
                            confidence = invertedConfidence;
                        } else if (betterColor === "blue") {
                            confidences = backendConfidence;
                            confidence = backendConfidence;
                        }
                    } else if (moreRedSide === "right") {
                        if (betterColor === "red") {
                            confidences = backendConfidence;
                            confidence = backendConfidence;
                        } else {
                            confidences = invertedConfidence;
                            confidence = invertedConfidence;
                        }
                    }
                }

                if (confidence > 50) {
                    correctResponse = true;
                } else {
                    correctResponse = false;
                }
            }
        }

        function buttonBackend(type) {
            // turn off the button options
            $('.scale-button').addClass('invisible');

            // record RT and reset the timer
            confidence_timer = Date.now();
            var RT = calculateRT(start_timer, confidence_timer);
            RTs.push(RT);


            // other options
            switch (type) {
                // not needed
                case 'exit':
                    sliderActive = true;
                    break;

                // yellow button for More Info is clicked
                case 'seeMore':
                    secondTimeAround = true;
                    recordRating(backendConfidence, moreRedSide, type, betterColor);

                    // reset the trial timer
                    start_timer = Date.now();

                    // set options for 'See Again' based on specified parameter

                    // same grid (simple mask-lifting)

                    $('.response-area').css('visibility', 'hidden');
                    $('.confidence-question').css('visibility', 'hidden');
                    $('.grid-mask').css('visibility', 'hidden');
                    $('#jspsych-canvas-sliders-response-canvas').css('visibility', 'hidden');


                    var fixationCross = createGeneral(
                        fixationCross,
                        document.getElementById('jspsych-canvas-sliders-response-wrapper'),
                        'div',
                        'fixation-cross see-again',
                        'fixation-cross',
                        '+'
                    );

                    setTimeout(function () {
                        document.getElementById('fixation-cross').remove();
                        $('#jspsych-canvas-sliders-response-canvas').css('visibility', 'visible');

                        setTimeout(function () {
                            $('.grid-mask').css('visibility', 'visible');

                            setTimeout(function () {
                                sliderActive = true;
                                $('.confidence-question').css('visibility', 'visible');
                                $('.response-area').css('visibility', 'visible');
                                document.getElementById('more-button').remove();
                                $('.submit-button').css('margin-left', '0');
                            }, transitionPeriod);
                        }, stimulusPeriod);
                    }, fixationPeriod);

                    break;

                default:
                    recordRating(backendConfidence, moreRedSide, type, betterColor);

                    if (isTutorialMode && condition != "practice2") {
                        squircleStaircase.next(correctResponse);
                    }

                    if (secondTimeAround) {
                        trialDataVariable['moreAsked'].push(true);
                    } else {
                        trialDataVariable['moreAsked'].push(false);

                        // calculate the wait time
                        var waitTime = fixationPeriod + stimulusPeriod + transitionPeriod + RT;
                        if (waitTime > waitTimeLimit) {
                            waitTime = waitTimeLimit;
                        }
                    }

                    trialDataVariable['waitTimes'].push(waitTime);
                    trialDataVariable['isCorrect'].push(correctResponse); // this is for calculating the bonus
                    trialDataVariable['moreRedMean'].push(Math.max(color_mean, color_mean_two));
                    trialDataVariable['moreBlueMean'].push(Math.min(color_mean, color_mean_two));
                    trialDataVariable['differenceStep'].push(difference);
                    trialDataVariable['moreRedMeanLevel'].push(Math.max(color_mean_level, color_mean_two_level));
                    trialDataVariable['moreBlueMeanLevel'].push(Math.min(color_mean_level, color_mean_two_level));
                    trialDataVariable['colorSD'].push(color_sd);
                    trialDataVariable['leftStimulus'].push(leftStimulus);
                    trialDataVariable['rightStimulus'].push(rightStimulus);
                    trialDataVariable['leftStimulusHalf'].push(leftStimulusHalf);
                    trialDataVariable['rightStimulusHalf'].push(rightStimulusHalf);
                    trialDataVariable['com_cost'].push(com_cost);
                    trialDataVariable['moreRedSide'].push(moreRedSide);
                    trialDataVariable['confidences'].push(confidences);
                    trialDataVariable['secondConfidences'].push(secondConfidences);
                    trialDataVariable['RTs'].push(RTs);
                    trialDataVariable['isTutorialMode'].push(isTutorialMode);
                    trialDataVariable['condition'].push(condition);
                    trialDataVariable['betterColor'].push(betterColor);
                    trialDataVariable['forcedSeeMore'].push(forcedSeeMore);
                    trialDataVariable['forcedContinue'].push(forcedContinue);
                    trialDataVariable['cumulativePoints'].push(cumulativePoints);
                    trialCounterVariable++;
                    totalTrials++;
                    trialDataVariable['trial_count'].push(totalTrials);

                    console.log('left stimulus: '+leftStimulus);
                    console.log('right stimulus: '+rightStimulus);


                    // give feedback
                    if (isTutorialMode) {
                        points = 0;
                        if (correctResponse) {
                            if (betterColor === "red") {
                                document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(255,0,0)">CORRECT</h1>';
                            } else {
                                document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(0,100,255)">CORRECT</h1>';
                            }
                        } else {
                            if (betterColor === "red") {
                                document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(0,100,255)">INCORRECT</h1>';
                            } else {
                                document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(255,0,0)">INCORRECT</h1>';
                            }
                        }
                    } else {
                        if (condition === "value-value") {
                            if (correctResponse) {
                                if (betterColor === "red") {
                                    // get points of red stimulus
                                    points = round(0.1*(Math.max(color_mean_level, color_mean_two_level) + 1),1);
                                    document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(255,0,0); font-size: 5em; margin: -3vh auto 2vh; z-index: 100; -webkit-transform:translate3d(0,0,0);">WIN '+ points + '</h1>';
                                } else {
                                    // get points of blue stimulus which is 100 - blue stim level
                                    points = round(0.1*(100-((Math.min(color_mean_level, color_mean_two_level)))),1);
                                    document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(0,100,255); font-size: 5em; margin: -3vh auto 2vh; z-index: 100; -webkit-transform:translate3d(0,0,0);">WIN '+ points + '</h1>';
                                }
                            } else {
                                if (betterColor === "red") {
                                    // get points of blue stimulus
                                    points = round(0.1*(Math.min(color_mean_level, color_mean_two_level) + 1),1);
                                    document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(0,100,255); font-size: 5em; margin: -3vh auto 2vh; z-index: 100; -webkit-transform:translate3d(0,0,0);">WIN '+ points + '</h1>';
                                } else if (betterColor === "blue")  {
                                    // get points of red stimulus which is 100 - red stim level
                                    points = round(0.1*(100-((Math.max(color_mean_level, color_mean_two_level)))),1);
                                    document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(255,0,0); font-size: 5em; margin: -3vh auto 2vh; z-index: 100; -webkit-transform:translate3d(0,0,0);">WIN '+ points + '</h1>';
                                }
                            }
                        } else {
                            if (correctResponse) {
                                if (betterColor === "red") {
                                    points = round(0.1*(Math.max(color_mean_level, color_mean_two_level) + 1),1);
                                    document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(255,0,0); font-size: 5em; margin: -3vh auto 2vh; z-index: 100; -webkit-transform:translate3d(0,0,0);">WIN '+ points + '</h1>';
                                } else if (betterColor === "blue") {
                                    points = round(0.1*(100-((Math.min(color_mean_level, color_mean_two_level)))),1);
                                    document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(0,100,255); font-size: 5em; margin: -3vh auto 2vh; z-index: 100; -webkit-transform:translate3d(0,0,0);">WIN '+ points + '</h1>';
                                }
                            } else {
                                if (betterColor === "red") {
                                    points = round(-0.1*(Math.min(color_mean_level, color_mean_two_level) + 1),1);
                                    document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(0,100,255); font-size: 5em; margin: -3vh auto 2vh; z-index: 100; -webkit-transform:translate3d(0,0,0);">LOSE '+ Math.abs(points) + '</h1>'; // only using the minus in the string and then the absolute point value here because otherwise the minus is difficult to see!
                                } else if (betterColor === "blue")  {
                                    points = round(-0.1*(100-((Math.max(color_mean_level, color_mean_two_level)))),1);
                                    document.getElementById('confidence-question').innerHTML = '<h1 style="color: rgb(255,0,0); font-size: 5em; margin: -3vh auto 2vh; z-index: 100; -webkit-transform:translate3d(0,0,0);">LOSE '+ Math.abs(points) + '</h1>';
                                }
                            }
                        }

                    }
                    trialDataVariable['points'].push(points);
                    cumulativePoints = cumulativePoints + points;

                    setTimeout(function () {
                        // clear the display on a timer
                        document.getElementById('jspsych-canvas-sliders-response-wrapper').remove();
                        document.getElementById('response-area').remove();
                    }, 1000);

                    if (isTutorialMode===false) {
                        //totalTrials++;
                    }

                    if (trialCounterVariable < trialCount) {
                        // draw the fixation cross
                        setTimeout(function () { drawFixation(parent, canvasWidth, canvasHeight, squircleStaircase, upperColor, lowerColor, tooltipLabels, endLabels, waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, condition, betterColor); }, 1000);

                    } else {
                        // evaluate accuracy
                        setTimeout(function () {
                            var accuracy = round(mean(trialDataVariable['isCorrect']), 2) * 100;
                            // console.log('accuracy: ' + accuracy);

                            if (isTutorialMode && condition != "practice2") {
                                if (accuracy >= accuracyThreshold) {
                                    var section4_text = 'Congratulations, your accuracy during the last set of trials was ' + accuracy + '%.';
                                    var section4_button = 'CONTINUE';
                                } else {
                                    var section4_text = 'Your accuracy during these trials was ' + accuracy + '%, which is below the required accuracy threshold. Please click "Repeat" below to repeat the last block.';
                                    var section4_button = 'REPEAT';
                                }

                                // set up feedback page
                                $('.jspsych-content-wrapper')
                                    .css('width', '100%');

                                var section4 = createGeneral(
                                    section4,
                                    parent,
                                    'section',
                                    'tutorial-section section4',
                                    'dots-tutorial-section4',
                                    ''
                                );

                                var section4_title = createGeneral(
                                    section4_title,
                                    section4,
                                    'div',
                                    'tutorial-text',
                                    'dots-tutorial-text4',
                                    section4_text
                                );

                                $('#dots-tutorial-text4').css('font-size', '3vmax');

                                var section4_button = createGeneral(
                                    section4_button,
                                    section4,
                                    'button',
                                    'default-white-button glowy-box',
                                    'dots-tutorial-continue',
                                    '<div>' + section4_button + '</div>'
                                );

                                if (accuracy >= accuracyThreshold) {
                                    $('#dots-tutorial-continue').on('click', function () {
                                        // console.log(trialDataVariable);
                                        permanentDataVariable["accuracy"].push(accuracy);
                                        permanentDataVariable['moreRedMean'].push(trialDataVariable["moreRedMean"]);
                                        permanentDataVariable['moreBlueMean'].push(trialDataVariable["moreBlueMean"]);
                                        permanentDataVariable['moreRedMeanLevel'].push(trialDataVariable["moreRedMeanLevel"]);
                                        permanentDataVariable['moreBlueMeanLevel'].push(trialDataVariable["moreBlueMeanLevel"]);
                                        permanentDataVariable['differenceStep'].push(trialDataVariable["differenceStep"]);
                                        permanentDataVariable['colorSD'].push(trialDataVariable["colorSD"]);
                                        permanentDataVariable['leftStimulus'].push(trialDataVariable["leftStimulus"]);
                                        permanentDataVariable['rightStimulus'].push(trialDataVariable["rightStimulus"]);
                                        permanentDataVariable['leftStimulusHalf'].push(trialDataVariable["leftStimulusHalf"]);
                                        permanentDataVariable['rightStimulusHalf'].push(trialDataVariable["rightStimulusHalf"]);
                                        permanentDataVariable['com_cost'].push(trialDataVariable["com_cost"]);
                                        permanentDataVariable["moreRedSide"].push(trialDataVariable["moreRedSide"]);
                                        permanentDataVariable["confidences"].push(trialDataVariable["confidences"]);
                                        permanentDataVariable["secondConfidences"].push(trialDataVariable["secondConfidences"]);
                                        permanentDataVariable["moreAsked"].push(trialDataVariable["moreAsked"]);
                                        permanentDataVariable["isCorrect"].push(trialDataVariable["isCorrect"]);
                                        permanentDataVariable["RTs"].push(trialDataVariable["RTs"]);
                                        permanentDataVariable["waitTimes"].push(trialDataVariable["waitTimes"]);
                                        permanentDataVariable["betterColor"].push(trialDataVariable["betterColor"]);
                                        permanentDataVariable["condition"].push(trialDataVariable["condition"]);
                                        permanentDataVariable["isTutorialMode"].push(trialDataVariable["isTutorialMode"]);
                                        permanentDataVariable["forcedSeeMore"].push(trialDataVariable["forcedSeeMore"]);
                                        permanentDataVariable["forcedContinue"].push(trialDataVariable["forcedContinue"]);
                                        permanentDataVariable["points"].push(trialDataVariable["points"]);
                                        permanentDataVariable["cumulativePoints"].push(trialDataVariable["cumulativePoints"]);
                                        permanentDataVariable["trial_count"].push(trialDataVariable["trial_count"]);


                                        saveCSV(subjectID, currentAttempt);

                                        $('body').css('cursor', 'auto');
                                        jsPsych.finishTrial();
                                        return;
                                    });
                                } else {
                                    totalTrials = 0; // reset the trial count
                                    $('#dots-tutorial-continue').on('click', function () {
                                        drawFixation(parent, canvasWidth, canvasHeight, squircleStaircase, upperColor, lowerColor, tooltipLabels, endLabels, waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, condition, betterColor);
                                        return;
                                    });
                                }
                            } else {
                                // if not in tutorial mode
                                permanentDataVariable["accuracy"].push(accuracy);
                                permanentDataVariable["points"].push(trialDataVariable["points"]);
                                permanentDataVariable["isTutorialMode"].push(trialDataVariable["isTutorialMode"]);
                                permanentDataVariable["condition"].push(trialDataVariable["condition"]);
                                permanentDataVariable["betterColor"].push(trialDataVariable["betterColor"]);
                                permanentDataVariable['moreRedMean'].push(trialDataVariable["moreRedMean"]);
                                permanentDataVariable['moreBlueMean'].push(trialDataVariable["moreBlueMean"]);
                                permanentDataVariable['differenceStep'].push(trialDataVariable["differenceStep"]);
                                permanentDataVariable['moreRedMeanLevel'].push(trialDataVariable["moreRedMeanLevel"]);
                                permanentDataVariable['moreBlueMeanLevel'].push(trialDataVariable["moreBlueMeanLevel"]);
                                permanentDataVariable['colorSD'].push(trialDataVariable["colorSD"]);
                                permanentDataVariable['leftStimulus'].push(trialDataVariable["leftStimulus"]);
                                permanentDataVariable['rightStimulus'].push(trialDataVariable["rightStimulus"]);
                                permanentDataVariable['leftStimulusHalf'].push(trialDataVariable["leftStimulusHalf"]);
                                permanentDataVariable['rightStimulusHalf'].push(trialDataVariable["rightStimulusHalf"]);
                                permanentDataVariable['com_cost'].push(trialDataVariable["com_cost"]);
                                permanentDataVariable["moreRedSide"].push(trialDataVariable["moreRedSide"]);
                                permanentDataVariable["confidences"].push(trialDataVariable["confidences"]);
                                permanentDataVariable["secondConfidences"].push(trialDataVariable["secondConfidences"]);
                                permanentDataVariable["moreAsked"].push(trialDataVariable["moreAsked"]);
                                permanentDataVariable["isCorrect"].push(trialDataVariable["isCorrect"]);
                                permanentDataVariable["RTs"].push(trialDataVariable["RTs"]);
                                permanentDataVariable["waitTimes"].push(trialDataVariable["waitTimes"]);
                                permanentDataVariable["forcedSeeMore"].push(trialDataVariable["forcedSeeMore"]);
                                permanentDataVariable["forcedContinue"].push(trialDataVariable["forcedContinue"]);
                                permanentDataVariable["cumulativePoints"].push(trialDataVariable["cumulativePoints"]);
                                permanentDataVariable["trial_count"].push(trialDataVariable["trial_count"]);

                                totalCorrect += trialDataVariable.isCorrect.filter(Boolean).length;
                                blockCount++;
                                permanentDataVariable["block_count"].push(blockCount);

                                saveCSV(subjectID, currentAttempt);

                                $('body').css('cursor', 'auto');
                                jsPsych.finishTrial();
                                return;
                            }
                        }, 1500);
                    }
            }
        }


        var costMessage = createGeneral(
            costMessage,
            document.getElementById('jspsych-content'),
            'div',
            '',
            'costMessage',
            ''
        );
        costMessage.innerHTML = 'pay <highlight style=\"color:mediumspringgreen\">' + com_cost + ' points</highlight> to change your mind';


        $('.scale-row').on({
            mousemove: function (event) {
                var scaleOffsetLeft = cumulativeOffset(document.getElementById('scale')).left;
                var scaleWidth = document.getElementById('scale').offsetWidth;
                var Xmin = scaleOffsetLeft;

                if (sliderActive) {
                    backendConfidence = Math.round(((event.pageX - Xmin) / scaleWidth) * 100);

                    if (backendConfidence >= 100) {
                        backendConfidence = 100;
                        displayedConfidence = backendConfidence;
                        document.body.style.setProperty('--displayedColor', upperColor);
                    } else if (backendConfidence < 100 && backendConfidence >= 51) {
                        backendConfidence = backendConfidence;
                        displayedConfidence = backendConfidence;
                        document.body.style.setProperty('--displayedColor', upperColor);
                    } else if (backendConfidence < 51 && backendConfidence >= 49) {
                        backendConfidence = backendConfidence;
                        displayedConfidence = 51;
                        if (backendConfidence >= 50) {
                            document.body.style.setProperty('--displayedColor', upperColor);
                        } else {
                            document.body.style.setProperty('--displayedColor', lowerColor);
                        }
                    } else if (backendConfidence < 49 && backendConfidence > 0) {
                        backendConfidence = backendConfidence;
                        displayedConfidence = 100 - backendConfidence;
                        document.body.style.setProperty('--displayedColor', lowerColor);
                    } else {
                        backendConfidence = 0;
                        displayedConfidence = 100 - backendConfidence;
                        document.body.style.setProperty('--displayedColor', lowerColor);
                    }

                    // change of mind cost message
                    // if (secondTimeAround === true && isTutorialMode == false) {
                    if (secondTimeAround === true) {
                        if (confidences > 50) {
                            if (moreRedSide === 'left') { // first response LEFT
                                if (backendConfidence > 51) { // right, i.e. change of mind
                                    costMessage.style.zIndex = "100";
                                } else {
                                    costMessage.style.zIndex = "-100"; // left, i.e. no change of mind
                                }
                            } else { // first response was RIGHT
                                if (backendConfidence > 50.5) { // right, i.e. no change of mind
                                    costMessage.style.zIndex = "-100";
                                } else {
                                    costMessage.style.zIndex = "100"; // left, i.e. change of mind
                                }
                            }
                        } else {
                            if (moreRedSide === 'left') { // first response RIGHT
                                if (backendConfidence > 50.5) { // right, i.e. no change of mind
                                    costMessage.style.zIndex = "-100";
                                } else {
                                    costMessage.style.zIndex = "100"; // left, i.e. change of mind
                                }
                            } else { // first response was LEFT
                                if (backendConfidence > 50.5) { // right, i.e. change of mind
                                    costMessage.style.zIndex = "100";
                                } else {
                                    costMessage.style.zIndex = "-100"; // left, i.e. no change of mind
                                }
                            }
                        }

                    }

                    var barWidth = Math.abs((displayedConfidence - 50) * 0.5);
                    if (backendConfidence >= 50) {
                        if (betterColor === "red") {
                            $('#scale-right-fill, #confidence-value-right').css('width', barWidth.toString() + 'vmin').css('border-right', '5px solid rgb(255,0,0)'); //color of confidence slider indicator
                        } else {
                            $('#scale-right-fill, #confidence-value-right').css('width', barWidth.toString() + 'vmin').css('border-right', '5px solid rgb(0, 100, 255)'); //color of confidence slider indicator
                        }
                        $('#scale-left-fill, #confidence-value-left').css('width', '0vmin').css('border-left', '5px solid rgba(0,0,0,0)');
                    } else if (backendConfidence < 50) {
                        if (betterColor === "red") {
                            $('#scale-left-fill, #confidence-value-left').css('width', barWidth.toString() + 'vmin').css('border-left', '5px solid rgb(255,0,0)'); //color of confidence slider indicator
                        } else {
                            $('#scale-left-fill, #confidence-value-left').css('width', barWidth.toString() + 'vmin').css('border-left', '5px solid rgb(0, 100, 255)'); //color of confidence slider indicator
                        }
                        $('#scale-right-fill, #confidence-value-right').css('width', '0vmin').css('border-right', '5px solid rgba(0,0,0,0)');
                    }
                }
            },
            click: function () {
                sliderActive = false;

                if (!sliderActive) {
                    if (condition === "practice1") {
                        //automatically trigger the continue button in practice 1 because there is no choice anyways
                        setTimeout(function () {
                            buttonBackend('submit');
                        }, 600)
                    } else {
                        // otherwise show buttons
                        $('.scale-button').removeClass('invisible');
                        if (forcedSeeMoreTemp === true) {
                            $('.submit-button').addClass('invisible');
                            forcedSeeMoreTemp = false;
                        }
                    }

                }
                // record data
                confidence_timer = Date.now();
                var RT = calculateRT(start_timer, confidence_timer);
                RTs.push(RT);
                recordRating(backendConfidence, moreRedSide, 'initial', betterColor);
            },
        });

        $('.escape-button').on('click', function () {
            buttonBackend('exit');
        });

        $('.more-button').on('click', function () {
            buttonBackend('seeMore');
        });

        $('.submit-button').on('click', function () {
            buttonBackend('submit');
        });


    }, stimulusPeriod);

}


/**
 * @function drawFixation()
 * @param {Object} parent - parent div
 * @param {int} canvasWidth - width of the canvas for dot grids
 * @param {int} canvasHeight - height of the canvas for dot grids
 * @param {Object} squircleStaircase
 * @param {string} upperColor - colour for the right side of the scale
 * @param {string} lowerColor - colour for the left side of the scale
 * @param {Array} tooltipLabels
 * @param {Array} endLabels
 * @param {int} waitTimeLimit - maximum wait time
 * @param {int} fixationPeriod - duration of fixation period
 * @param {int} stimulusPeriod
 * @param {int} transitionPeriod
 * @param {int} trialCount
 * @param {int} trialCounterVariable
 * @param {Object} trialDataVariable
 * @param {Object} permanentDataVariable
 * @param {boolean} isTutorialMode
 * @param {int} accuracyThreshold
 * @param {boolean} redButtonEnabled
 * @param {string} redButtonName
 * @param {boolean} yellowButtonEnabled
 * @param {string} yellowButtonName
 * @param {boolean} greenButtonEnabled
 * @param {string} greenButtonName
 * @param {string} condition
 * @param {string} betterColor
 */

//the script starts with the drawFixation function which is called in the jspsych-squircles (this is also where all the necessary variable values are specified!)
function drawFixation(parent, canvasWidth, canvasHeight, squircleStaircase, upperColor, lowerColor, tooltipLabels, endLabels, waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, condition, betterColor) {

    // set style defaults for page
    parent.innerHTML = '';
    $('body')
        .css('display', 'block')
        .css('height', '100%')
        .css('background-color', 'black')
        .css('overflow', 'hidden')
        .css('cursor', 'none');
    $('.jspsych-display-element')
        .css('display', 'flex')
        .css('margin', 'auto')
        .css('justify-content', 'center')
        .css('align-items', 'center')
        .css('flex-wrap', 'wrap')
        .css('wrap-direction', 'column');
    $.scrollify.destroy();

    //create the fixation cross
    var fixationCross = createGeneral(
        fixationCross,
        parent,
        'div',
        'fixation-cross',
        'fixation-cross',
        '+'
    );

    //timeout function clears the fixation cross, then draws the canvas for the dots grid, and then calls the drawSquircles function
    setTimeout(function () {
        // clear the fixation cross display
        document.getElementById('fixation-cross').remove();
        // draw the canvas for the dots grid
        var canvasID = 'jspsych-canvas-sliders-response-canvas';
        var canvas = '<canvas id="' + canvasID + '" height="' + canvasHeight +
            '" width="' + canvasWidth + '"></canvas>';

        let html = '<div id="jspsych-canvas-sliders-response-wrapper" class="jspsych-sliders-response-wrapper">';
        html += '<div id="jspsych-canvas-sliders-response-stimulus" style="display:flex">' + canvas + '</div>';

        parent.innerHTML += html;

        // call the draw squircles function
        let stimuli = drawSquircles(parent, canvasID, canvasWidth, canvasHeight, squircleStaircase, upperColor, lowerColor, tooltipLabels, endLabels,  waitTimeLimit, fixationPeriod, stimulusPeriod, transitionPeriod, trialCount, trialCounterVariable, trialDataVariable, permanentDataVariable, isTutorialMode, accuracyThreshold, redButtonEnabled, redButtonName, yellowButtonEnabled, yellowButtonName, greenButtonEnabled, greenButtonName, condition, betterColor);
        leftStimulus = stimuli[0];
        rightStimulus = stimuli[1];
    }, fixationPeriod);
}
