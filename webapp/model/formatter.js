sap.ui.define([], function() {
	'use strict';

	return {
    /**
     * Rounds the number unit value to 2 digits
     * @public
     * @param {string} sValue the number string to be rounded
     * @returns {string} sValue with 2 digits rounded
     */
    numberUnit: function(sValue) {
      if (!sValue) {
        return "";
      }
      return parseFloat(sValue).toFixed(2);
    },

    formatHours: function(sSchrijf, sContract) {
      var sState = "Error";
      if (sSchrijf < sContract) {
        sState = "Success";
      }

      return sState;
    },

    availableState: function(sStateValue) {
      var sStateValueToLower = sStateValue.toLowerCase();

      switch (sStateValueToLower) {
        case "ok":
          return 8;
        case "teveel":
          return 3;
        case "te weinig":
          return 5;
        default:
          return 9;
      }
    },

    formatVariabelSaldo: function(oVariabelSaldo, oContracturen) {
      var iVariabelSaldo = parseFloat(oVariabelSaldo);
      var iContracturen = parseFloat(oContracturen);
      var iGrenswaardeVariabelSaldo = (100 * iContracturen) / 36;
      var sReturn = "sap-icon://accept";
      if (iVariabelSaldo >= 0) {
        if (iVariabelSaldo < iGrenswaardeVariabelSaldo) {
          sReturn = "sap-icon://circle-task";
        } else {
          sReturn = "sap-icon://circle-task-2";
        }
      } else {
        if (iVariabelSaldo > iGrenswaardeVariabelSaldo * -1) {
          sReturn = "sap-icon://circle-task";
        } else {
          sReturn = "sap-icon://circle-task-2";
        }
      }
      return sReturn;
    },

    formatVariabelSaldoColor: function(oVariabelSaldo, oContracturen) {
      var iVariabelSaldo = parseFloat(oVariabelSaldo);
      var iContracturen = parseFloat(oContracturen);
      var iGrenswaardeVariabelSaldo = (100 * iContracturen) / 36;
      var sReturn = "green";
      if (iVariabelSaldo >= 0) {
        if (iVariabelSaldo < iGrenswaardeVariabelSaldo) {
          sReturn = "green";
        } else {
          sReturn = "red";
        }
      } else {
        if (iVariabelSaldo > iGrenswaardeVariabelSaldo * -1) {
          sReturn = "green";
        } else {
          sReturn = "red";
        }
      }
      return sReturn;
    },

    formatGrensWaarde: function(oContracturen) {
      return ((100 * parseFloat(oContracturen).toFixed()) / 36).toFixed(2);
    },

    // format date in current locale setting
    formatDateString: function(sDate) {
      var sFormat = 'dd-MM-yyyy';

      if (typeof sDate === "String") {
        var sYYYY = sDate.substr(6, 4);
        var sMM = parseInt(sDate.substr(4, 2)) - 1;
        var sDD = sDate.substr(0, 2);

        var dateUI = new Date();
        dateUI.setMonth(sMM);
        dateUI.setDate(sDD);
        dateUI.setMonth(sMM); //for months with less than 30 days have to recall this method
        dateUI.setDate(sDD);
        dateUI.setFullYear(sYYYY);
        dateUI.setHours(0);
        dateUI.setMinutes(0);
        dateUI.setSeconds(0);
        var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({
          pattern: sFormat
        });
        var sNewDate = oDateFormat.format(dateUI);
      }
      return typeof sDate === "String" ? sNewDate : sDate;
    }
  };
});
