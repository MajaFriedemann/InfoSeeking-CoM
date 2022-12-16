jsPsych.plugins['jspsych-squircles'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-squircles',
    parameters: {
      isTutorialMode: {
        type: jsPsych.plugins.parameterType.BOOL,
        default: false,
        description: 'Specifies whether the block is in tutorial mode or not.'
      },
      betterColor: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "red",
        description: 'Specifies whether the better color is blue or red, ie if color to value scale goes from blue(0) to red (100) or the other way around.'
      },
      condition: {
        type: jsPsych.plugins.parameterType.STRING,
        default: "value-value",
        description: 'Specifies whether the condition is value-value or value-nothing'
      },
      canvasHTML: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        pretty_name: 'Canvas HTML',
        default: null,
        description: 'HTML for drawing the canvas. ' +
          'Overrides canvas width and height settings.'
      },
      canvasWidth: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Canvas width',
        default: 1000,
        description: 'Sets the width of the canvas.'
      },
      canvasHeight: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Canvas height',
        default: 600,
        description: 'Sets the height of the canvas.'
      },
      leftColor: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Left-side colour',
        default: "#FE5F55",
        description: 'Colour for the left side of the confidence slider'
      },
      rightColor: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Right-side colour',
        default: '#62BFED',
        description: 'Colour for the right side of the confidence slider'
      },
      waitTimeLimit: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Wait time limit',
        default: Infinity,
        description: 'Optional parameter to set a wait time limit for the next trial on a seeMore trial.'
      },
      trial_count: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial count',
        default: 100,
        description: 'Number of trials'
      },
      accuracyThreshold: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Accuracy threshold',
        default: 55,
        description: 'Accuracy threshold (in %)'
      },
      redButtonEnabled: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Red button enabled?',
        default: false,
        description: 'Is the red (left) button enabled?'
      },
      redButtonName: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Red button name',
        default: 'ESCAPE',
        description: 'Text for the red (left) button'
      },
      yellowButtonEnabled: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Yellow button enabled?',
        default: true,
        description: 'Is the yellow (middle) button enabled?'
      },
      yellowButtonName: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Yellow button name',
        default: 'SEE MORE',
        description: 'Text for the yellow (middle) button'
      },
      greenButtonEnabled: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Green button enabled',
        default: true,
        description: 'Is the green (right) button enabled?'
      },
      greenButtonName: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Green button name',
        default: 'SUBMIT',
        description: 'Text for the green (right) button'
      },
      blockCounterEnabled: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Block counter enabled?',
        default: false,
        description: 'Is the block counter enabled?'
      },
    }
  };


  plugin.trial = function (display_element, trial) {

    var tempStorage = {
      trial_count: [],
      moreRedMean: [],
      moreBlueMean: [],
      differenceStep: [],
      moreRedMeanLevel: [],
      moreBlueMeanLevel: [],
      condition: [],
      betterColor: [],
      colorSD: [],
      leftStimulus: [],
      rightStimulus: [],
      leftStimulusHalf: [],
      rightStimulusHalf: [],
      com_cost: [],

      moreRedSide: [],
      confidences: [],
      secondConfidences: [],
      initial_choices: [],
      moreAsked: [],
      isCorrect: [],
      isTutorialMode: [],
      firstIsCorrect: [],
      RTs: [],
      waitTimes: [],
      points: [],

      forcedSeeMore: [],
      forcedContinue: [],
      cumulativePoints: [],
    };

    // set confidence slider options
    var tooltipLabels = [
      'probably<br>LEFT',
      'maybe<br>LEFT',
      'maybe<br>RIGHT',
      'probably<br>RIGHT'
    ];
    var endLabels = [
      '<div>certainly<br>LEFT</div>',
      '<div>certainly<br>RIGHT</div>'
    ];
    var upperColor = trial.leftColor;
    var lowerColor = trial.rightColor;
    document.body.style.setProperty('--leftColor', trial.leftColor);
    document.body.style.setProperty('--rightColor', trial.rightColor);

    var fixationPeriod = 1000;
    var stimulusPeriod = 600;
    var transitionPeriod = 500;
    var trialCounter = 0;

    if (trial.blockCounterEnabled) {
      blockCounter++;
    }

    $(document).ready(drawFixation(
      display_element,
      trial.canvasWidth,
      trial.canvasHeight,
      squircleStaircase,
      upperColor,
      lowerColor,
      tooltipLabels,
      endLabels,
      trial.waitTimeLimit,
      fixationPeriod,
      stimulusPeriod,
      transitionPeriod,
      trial.trial_count,
      trialCounter,
      tempStorage,
      dataObject,
      trial.isTutorialMode,
      trial.accuracyThreshold,
      trial.redButtonEnabled,
      trial.redButtonName,
      trial.yellowButtonEnabled,
      trial.yellowButtonName,
      trial.greenButtonEnabled,
      trial.greenButtonName,
      trial.condition,
      trial.betterColor,
      ));

  };

  return plugin;
})();
