sap.ui.define([
	] , function () {
		"use strict";

		return {

			/**
			 * Rounds the number unit value to 2 digits
			 * @public
			 * @param {string} sValue the number string to be rounded
			 * @returns {string} sValue with 2 digits rounded
			 */
			numberUnit : function (sValue) {
				if (!sValue) {
					return "";
				}
				return parseFloat(sValue).toFixed(2);
			},
			
			formatHours : function(sSchrijf, sContract ){
				var sState = "Error";
				if(sSchrijf < sContract){
					sState = "Success";
				}
				
				return sState;
			},
	
		availableState: function (sStateValue) {
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
		}

		};

	}
);