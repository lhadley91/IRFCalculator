$("#genSample").click(function() {
  $("#input").val("BUR_BUJUMBURA_LN_REAL_USD = 0.848232867257*BUR_BUJUMBURA_LN_REAL_USD(-1) - 0.548182784475*BUR_BUJUMBURA_LN_REAL_USD(-2) - 0.493762697936*BUR_GITEGA_LN_REAL_USD(-1) + 0.309935865933*BUR_GITEGA_LN_REAL_USD(-2) - 0.211877016758*BUR_NGOZI_LN_REAL_USD(-1) + 0.375555770199*BUR_NGOZI_LN_REAL_USD(-2) + 0.497730387941*RWA_KAMEMBE_LN_REAL_USD(-1) - 0.0952884463156*RWA_KAMEMBE_LN_REAL_USD(-2) + 1.88958492898\n\nBUR_GITEGA_LN_REAL_USD = -0.517842446355*BUR_BUJUMBURA_LN_REAL_USD(-1) - 0.131158235922*BUR_BUJUMBURA_LN_REAL_USD(-2) + 0.959097809772*BUR_GITEGA_LN_REAL_USD(-1) - 0.164445773121*BUR_GITEGA_LN_REAL_USD(-2) - 0.292975455163*BUR_NGOZI_LN_REAL_USD(-1) + 0.441226624579*BUR_NGOZI_LN_REAL_USD(-2) + 0.491174321332*RWA_KAMEMBE_LN_REAL_USD(-1) - 0.0904431473859*RWA_KAMEMBE_LN_REAL_USD(-2) + 1.81419834735\n\nBUR_NGOZI_LN_REAL_USD = -0.600537535304*BUR_BUJUMBURA_LN_REAL_USD(-1) - 0.04028712529*BUR_BUJUMBURA_LN_REAL_USD(-2) - 0.602945541654*BUR_GITEGA_LN_REAL_USD(-1) + 0.438746330849*BUR_GITEGA_LN_REAL_USD(-2) + 1.35389850502*BUR_NGOZI_LN_REAL_USD(-1) - 0.254380842688*BUR_NGOZI_LN_REAL_USD(-2) + 0.527917134757*RWA_KAMEMBE_LN_REAL_USD(-1) - 0.130936920723*RWA_KAMEMBE_LN_REAL_USD(-2) + 1.83366165202\n\nRWA_KAMEMBE_LN_REAL_USD = -0.0205610811686*BUR_BUJUMBURA_LN_REAL_USD(-1) + 0.0289374458742*BUR_BUJUMBURA_LN_REAL_USD(-2) + 0.0950268321594*BUR_GITEGA_LN_REAL_USD(-1) - 0.102576856791*BUR_GITEGA_LN_REAL_USD(-2) - 0.0630960455219*BUR_NGOZI_LN_REAL_USD(-1) + 0.0760969254131*BUR_NGOZI_LN_REAL_USD(-2) + 0.883408743213*RWA_KAMEMBE_LN_REAL_USD(-1) + 0.0942245381984*RWA_KAMEMBE_LN_REAL_USD(-2) + 0.0378191282975");
});
$("#genVars").click(function() {
  formula = $("#input").val();
  systemArray = {};
  //Split equations
  equationsArray = formula.split(/\r?\n/).filter(Boolean);

  $.each(equationsArray, function(eqKey, equation) {
    //Split Equation into left and right
    equationGroup = equation.split(' = ')[0];
    eqRightside = equation.split(' = ')[1];
    //Add this equation to array
    systemArray[equationGroup] = {};
    //Split Rightside into each coefficient pair
    	coefficientsArray = eqRightside.replace(/\s/g, '').split(")");
    //console.log(coefficientsArray);
    //Split coefficient pairs into variable and coefficient
    $.each(coefficientsArray, function(key, coefficientParts) {
      coefficient = coefficientParts.split("*")[0];
      coefficientVarFull = coefficientParts.split("*")[1];
      //Get coefficient Var
      if (coefficientVarFull) {

        coefficientVar = coefficientVarFull.split("(")[0];

        //Get Lag number for coefficient Var
        coefficientLag = coefficientVarFull.replace(/[^\d.-]/g, '').replace('-', 'l');

        //Create coefficent array to add
        coefficientArray = {
          [coefficientLag]: coefficient
        };

        //If var group is missing, create
        if (systemArray[equationGroup].hasOwnProperty(coefficientVar)) {
          systemArray[equationGroup][coefficientVar][coefficientLag] = coefficient;
        } else {
          systemArray[equationGroup][coefficientVar] = {};
        }
        //add coefficient & lag to var group
        systemArray[equationGroup][coefficientVar][coefficientLag] = coefficient;
      }
    });

  });
  //Write the headers
  columnsNum = 1;
  $.each(systemArray, function(equationGroup, equationArray) {
    $('#outputTable tr').append('<td>' + equationGroup + '</td>');
    columnsNum++;
  });
  //Write the first 5 lag rows
  for (period = -5; period <= 40; period++) {
    tableoutput = "<tr><td>" + period + "</td>";
    if (period == 0) {
      for (x = 0; x < columnsNum - 1; x++) {
        tableoutput += "<td><input type<input type='text' value='0' id='impulse'" + x + "></td>"; //CHANGE THIS TO 0 LATER
      }
    } else {
      for (z = 0; z < columnsNum - 1; z++) {
        tableoutput += "<td>0</td>";
      };
    }
    tableoutput += "</tr>";
    $('#outputTable').append(tableoutput);
  }
  //Add text inputs
  tableoutput = "<tr><td>0</td>";

  $('#outputTable').append(tableoutput);
});

//Calculate System
$("#genCalcs").click(function() {
  systemCalcs = {};
  columnHeaders = [];
  //add prev. lags to the calcs
  $('table tr').each(function(rowNum) {
    $(this).find('td').each(function() {
      columnNum = $(this).index();
      cellValue = $(this).text();
      //if cellValue is textInput
      if (cellValue == "") {
        $(this).find(':input').each(function() {
          cellValue = ($(this).val());
        });
      }
      //Add VAR Names
      if (rowNum == 0 && columnNum != 0) {
        systemCalcs[cellValue] = [];
        columnHeaders.push(cellValue);
      }
      //Push values to array
      if (rowNum > 0 && columnNum != 0) {
        systemCalcs[columnHeaders[columnNum - 1]].push(cellValue);
      }
    });
  });
  console.log(systemCalcs);

  //Begin to calculate in array
  startRow = 8;
  for(rowPointer = startRow; rowPointer <= 40 + startRow; rowPointer++) { //no calcs for lag periods + header +inputs
    $.each(systemArray, function(equationGroupName, equationVars) {
        columnPointer = jQuery.inArray(equationGroupName, columnHeaders)+2;
        //Create the calculation
        calcArray = [];
        $.each(equationVars, function(equationVar, equationLags) {
          //this is the set of variables for each equation now
          $.each(equationLags, function(lagName, lagCoefficient) {

            lagPointer = Number(lagName.substring(lagName.length - 1, lagName.length));
            arrayLagPointer = rowPointer - lagPointer-2;
            calc = lagCoefficient * systemCalcs[equationVar][arrayLagPointer]; 
            
            //console all this out for diagnostics
            /*
            console.log("Row:"+rowPointer+"\nEqGroup: "+equationGroupName+"\nEqVar: "+equationVar+"(Lag: "+lagPointer+")");
            console.log("arrayLagPointer: "+arrayLagPointer);
            console.log(systemCalcs[equationVar]);
            console.log("Calc="+lagCoefficient+"*"+systemCalcs[equationVar][arrayLagPointer]);
            console.log(calc);
            console.log("---");
            */
            calcArray.push(calc);
          });
        });
        //calculate Sum of calc Array
        sum = 0;
        $.each(calcArray, function() {
          sum += parseFloat(this) || 0;
        });
        //plug it into the table and array
        systemCalcs[equationGroupName][rowPointer - 2] = sum;
        
        $("table tr:nth-child(" + rowPointer + ") td:nth-child(" + columnPointer + ")").html(sum);
      });
    }
  console.log(systemCalcs);
});
$("#resetButton").click(function() {
	 $("#input").val("");
   $("table tr").remove();
   $("table").append("<tr><td>Period</td></tr>");
});