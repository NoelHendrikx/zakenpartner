sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
		},

		createAppModel: function () {
			var oModel = new JSONModel({
				store: {
					timedata: [{
						naam: 'Noel',
						zoeknaam: 'Noel',
						roepnaam: 'Noel',
						actvarsaldo: 120,
						indicatie: 'ok',
						grenswaardevariabelsaldo: 100,
						contracturen: 36,
						planuren: 40,
						klokuren: 32,
						schrijfuren: 41
					}, {
						naam: 'Miriam',
						zoeknaam: 'Miriam',
						roepnaam: 'Miriam',
						actvarsaldo: 110,
						indicatie: 'te weinig',
						grenswaardevariabelsaldo: 70,
						contracturen: 30,
						planuren: 31,
						klokuren: 22,
						schrijfuren: 29
					}]
				},
				filter : {
					jaar: new Date().getFullYear(),
					totenmet : '',
					intern : true
				},
				valuehelp: {
					year: this.createYearArray()
				}
			});
			return oModel;
		},
		
		createYearArray : function(){
			var aYears = [];
			
			for (var year = 2010; year < 2040; year++){
				aYears.push( { key : year.toString()});
			}
			return aYears;
		}

	};

});