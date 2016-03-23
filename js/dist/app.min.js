(function($) {
  
  var cache = {
    input: [],
    inputCluster: 0,
    memory: '',
    isCalculated: false
  };

  function init() {
    $('span').on('click', getInput);
    $(document).keypress(getInputByKeypress);
  }

  function getInputByKeypress(e) {
    var input;

    // If enter is pressed, set input to equal
    if ( e.which == '13' ) {
      input = '=';
    } else {
      // Only allow digits and operator/decimal presses -- Exception is 'c' for clear all
      if ( !String.fromCharCode(e.which).match(/[-*+.\/0-9c]/gi) ) {
        return;
      } else {
        input = String.fromCharCode(e.which);
      }
    }
    getInput(input);
  }

  function getInput(input) {
    var c = cache;
    var value;
    var previousInput;

    // Check for click or keypress
    if ( input.type == 'click' ) {
      value = $(this).text();
    } else {
      value = input;
    }

    // Set/Delete value in memory
    if ( value == 'MC' || value == 'MR' || value == 'MS' ) {
      setMemory(value);
      return;
    }

    // Setup backspace button
    if ( value == '←' ) {
      if ( c.input[c.inputCluster] === undefined || c.input[c.inputCluster].length < 1 ) {
        return;
      } else {
        c.input[c.inputCluster] = c.input[c.inputCluster].slice(0, -1);
        $('#output').text(c.input[c.inputCluster]);
        return;
      }
    } 

    if ( value.toLowerCase() == 'c' ) { // Clear all
      c.input = [];
      $('#output').text('0');
      $('#input').text('');
      c.inputCluster = 0;
      c.isCalculated = false;
    } else {
      switch (value) {
        case 'x':
          value = '*';
          break;
          case 'CE':
          // Clear current input on screen but not total input
          c.input[c.inputCluster] = '';
          break;
        case '=':
          calculate();
          return;
        case '%':
          getPercentage();
          return;         
      }
      // If nothing has been entered, create a new cluster and insert value
      if ( !c.input[c.inputCluster] ) {
        // If first input is 0 or NaN do nothing
        c.input[c.inputCluster] = isNaN(value) && value != '.' ? '' : value !== '0' ? value : '';
        if ( value == '.' ) {
          c.input[c.inputCluster] = '0.';
        }
        $('#output').text(isNaN(value) && c.input[c.inputCluster] != '0.' ? '0' : c.input[c.inputCluster]);
      } else { // Some input has been entered
        previousInput = c.input[c.inputCluster];
        if ( c.isCalculated === true ) { // Previous operation has been made
        	// If number entered, clear input
        	if ( !isNaN(value) ) c.input[c.inputCluster] = '';
        	// If decimal entered
        	if ( value == '.' ) c.input[c.inputCluster] = '0';
        }
        c.isCalculated = false;
        if ( isNaN(value) ) { // Input is not a number 
          if ( value == '.' ) {
            // If a decimal has not been inputted, insert a decimal
            if ( !previousInput.includes('.') && c.input[0] != '0.' ) {
              c.input[c.inputCluster] += value;
              $('#output').text(c.input[c.inputCluster]);
            } else { // Already has a decimal
              return;
            }  
          } else {
            // Split operator into it's own cluster
            createNewCluster(value);
          }
        } else { // Input is a number
          c.input[c.inputCluster] += value;

          $('#output').text(c.input[c.inputCluster]);
        }
      }
    }
  }

  function createNewCluster(value) {
    var c = cache;

    c.inputCluster++;
    c.input[c.inputCluster] = '\u00A0' + value + '\u00A0';
    c.inputCluster++;
    $('#input').text(c.input.join(' '));
  }

  function setMemory(value) {
    var c = cache;
    
    if ( value == 'MS' && $('#output').text() != '0' ) {
      c.memory = c.input[c.inputCluster];
      $('#save').addClass('active');
    }

    if ( value == 'MR' ) {
      c.input[c.inputCluster] = c.memory;
      $('#output').text(c.memory);
    }

    if ( value == 'MC' ) {
      c.memory = '';
      $('#save').removeClass('active');
    }

    // If nothing is in memory, exit     
    if ( value == 'MR' && c.memory === '' ) {
      $('#output').text('0');
      return;
    }
  }

  function getPercentage() {
    var c = cache;
    var equation;

    // If no previous value to calculate percentage, exit
    if ( c.input[c.inputCluster - 2] === undefined ) {
      return;
    } else { // We have a number to calculate by
      // Standard percentage calculation
      equation = (c.input[c.inputCluster] / 100) * c.input[c.inputCluster -2];
      // If decimal place is greater than 3, round to 2 decimal places
      if ( equation.toString().split('').reverse().join('').indexOf('.') > 3 ) {
        c.input[c.inputCluster] = equation.toFixed(2);
      } else { // Return standard equation
        c.input[c.inputCluster] = equation;
      }
    }
     $('#output').html(c.input[c.inputCluster]);
  }

  function calculate() {
    var c = cache;
    var total;

    // If previous value is not a number value, exit
    if ( c.input[c.inputCluster] === undefined ) {
      return;
    }

    // If decimal place is greater than 3, round to two decimal places
    if ( eval(c.input.join('')).toString().split('').reverse().join('').indexOf('.') > 3 ) {
      total = eval(c.input.join('')).toFixed(2);
    } else {
      total = eval(c.input.join(''));
    }

    if ( c.input.length === 1 ) { // No previous values so return current value
      $('#output').text(c.input[1]);
    } else { // We have previous values
      $('#output').text(total);
      // Append equal sign to output value
      c.input[c.input.length - 1] += ['\u00A0' + '=' + '\u00A0' + total];
      $('#input').text(c.input.join(' '));
      c.input = [[total]];
      c.isCalculated = true;
      c.inputCluster = 0;
    }
  }
  
 init();

})(jQuery);