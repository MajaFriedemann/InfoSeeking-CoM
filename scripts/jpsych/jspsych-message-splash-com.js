jsPsych.plugins['jspsych-message-splash-com'] = (function(){

    var plugin = {};

    plugin.info = {
        name: 'jspsych-message-splash-com',
        prettyName: 'Message Splash with Image',
        parameters: {
            text: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Text',
                description: 'STRING: text for message'
            },
            img_id: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Image ID',
                description: 'STRING: HTML object ID for image object in section 2.'
            },
            buttonText: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Button text',
                default: 'CONTINUE',
                description: 'STRING: text for trial finish button.'
            }
        }
    };

    plugin.trial = function(display_element, trial){
        // clear display element and apply page default styles
        display_element.innerHTML = '';
        // need to call directly on the display_element
        display_element.style.backgroundColor = trial.backgroundColor;
        $('body')
            .css('height', 'auto')
            .css('color', trial.textColor)
            .css('overflow', 'hidden');
        $.scrollify.destroy();

        //create the page elements
        var page = createGeneral(
            page,
            display_element,
            'section',
            'tutorial-section section2',
            'notice-section2',
            ''
        );

        var page_image = createGeneral(
            page_image,
            page,
            'div',
            'gameboard-gif',
            trial.img_id,
            ''
        );

        var page_title = createGeneral(
            page_title,
            page,
            'div',
            'tutorial-text',
            'notice-text2',
            '<div id="section2-text">' + 'You may take a break if you like. <br><br>On this next block, changing your mind after seeing more will ' +
            'cost <highlight style="color: mediumspringgreen">' + cost_conditions[totalTrials+1] + ' points</highlight> ' +
            '<br><br>Click "continue" when you are ready to start this block of ' + trialsPerBlock + ' trials.' + '</div>'
        );

        $('.section2 .tutorial-text').css('font-size', '1.6vmax');
        //$('.section2 .tutorial-text').css('margin-top', '50vh');
        $('.section2 .tutorial-text').css('line-height', '4vmax');


        var continueButton = createGeneral(
            continueButton,
            page,
            'button',
            'default-green-button',
            trial.name + '-' + trial.buttonText + '-button',
            trial.buttonText
        );

        continueButton.onclick = function() {
            jsPsych.finishTrial();
        };


        // make sure page starts at the top every time
        $(document).ready(function () {
            $(this).scrollTop(0);
        });
    };

    return plugin;

})();