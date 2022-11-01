/*
 * Example plugin template
 */

jsPsych.plugins['jspsych-score-reveal'] = (function () {

  var plugin = {};

  plugin.info = {
    name: 'jspsych-score-reveal',
    parameters: {
      performanceType: {
        type: jsPsych.plugins.parameterType.STRING,
        description: 'Possible variations: "accuracy", "score", "Brier".'
      },
      bonusThreshold: {
        type: jsPsych.plugins.parameterType.INT,
        description: 'Only used for "accuracy" type calculations',
        default: 0
      },
      flatBonusAmount: {
        type: jsPsych.plugins.parameterType.INT,
        description: 'Only used for "accuracy" type calculations',
        default: 0
      },
      conversionFactor: {
        type: jsPsych.plugins.parameterType.FLOAT,
        description: 'Only used for "score" and "Brier" type calculations',
        default: 0.0003
      },
    }
  };

  plugin.trial = function (display_element, trial) {
    var paymentMessage;
    var currentBonus;
    var newBonusPayment;

    // calculate overall accuracy
    overallAccuracy = round(totalCorrect / totalTrials, 2) * 100;

    //jointOverallAccuracy = round(jointTotalCorrect / totalTrials, 2) * 100;

    var accurate = 0;
    for (var block=3; block <=5; block++) {
      accurate += dataObject["accuracy"][block];
    }
    accurate += accuracy;   //for the last block as this has not yet been pushed to the dataObject
    jointOverallAccuracy = accurate / 4;

    switch(trial.performanceType) {
      case 'accuracy':
        // calculate current bonus
        if (jointOverallAccuracy >= trial.bonusThreshold) {
          currentBonus = trial.flatBonusAmount;
        } else {
          currentBonus = 0;
        }
        // calculate total bonus
        newBonusPayment = bonusPayment + currentBonus; // bonusPayment defined globally
        // update messages
        paymentMessage = 'Congratulations, you have achieved an overall accuracy of ' + overallAccuracy + '% in this experiment!';
        break;

      case 'score':
        // calculate current bonus
        currentBonus = round(IST_cumulativeScore * trial.conversionFactor, 2);
        if (currentBonus < 0) {
          currentBonus = 0;
        }
        // calculate total bonus
        newBonusPayment = bonusPayment + currentBonus;
        // update messages
        paymentMessage = 'Congratulations, you have scored a total of ' + IST_cumulativeScore + ' points in the previous ' + IST_totalTrials + ' game rounds!';
        break;

      case 'Brier':
        // round score
        var roundedScore = Math.round(cumulativeScore);
        // calculate final Brier score
        currentBonus = round((cumulativeScore / totalTrials) * trial.conversionFactor, 2);
        // calculate total bonus
        newBonusPayment = bonusPayment + currentBonus;
        // update messages
        //paymentMessage = 'Congratulations, you have scored a total of ' + roundedScore + ' points in the previous ' + totalTrials + ' game rounds!';
        paymentMessage = 'Congratulations! You scored a total of '+ round(cumulativePoints,1) + ' and earned yourself a cash bonus of £2 :)';
        break;
    }

    // clear display element and apply page default styles
    display_element.innerHTML = '';
    $('body')
      .css('height', 'auto')
      .css('background-color', 'black')
      .css('overflow', 'hidden');
    $.scrollify.destroy();

    var splashPage = createGeneral(
      splashPage,
      display_element,
      'section',
      'section',
      'score-reveal-page',
      ''
    );

    var fullscreenMessage = createGeneral(
      fullscreenMessage,
      splashPage,
      'div',
      'main-message',
      'score-reveal-message',
      '<h1>' + paymentMessage + '</h1>'
    );

    var continueButton = createGeneral(
      continueButton,
      splashPage,
      'button',
      'default-green-button',
      'score-reveal-continue',
      'CONTINUE'
    );

    continueButton.onclick = function() {
      bonusPayment = 2; // newBonusPayment;
      jsPsych.finishTrial();
      return;
    };

    // make sure page starts at the top every time
    $(document).ready(function () {
      $(this).scrollTop(0);
    });
  };

  return plugin;
})();
